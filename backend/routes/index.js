const express = require("express");
const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const logger = require("morgan");
// const cors = require("cors");
const multer = require("multer");	// package for processing binary data of uploaded files
const uuid = require("uuid-v4");
const path = require("path");

const fs = require("fs");
const { promisify } = require("util");	// converts callback based fn to promise-based one for async control flow 
const unlinkAsync = promisify(fs.unlink);	// convert fs unlink method to a function that yields Promise for async control 
const mime = require("mime-types");

// load models for db schema
const Users = require(path.join(__dirname, "/../", "/models/users.js"));
const Files = require(path.join(__dirname, "/../", "/models/files.js"));

// load modules and packages for user authentication
const validateRegisterInput = require(path.join(__dirname, "/../", "/validation/register.js"));
const validateLoginInput = require(path.join(__dirname, "/../", "/validation/login.js"));

const bcrypt = require("bcryptjs");	// password encryption
const jwt = require("jsonwebtoken");	// validating endpoint transmissions 
const keys  = require(path.join(__dirname, "/../", "/config/keys.js"));	// holds keys

// load environment variables
// require("dotenv").config();

// ping Heroku
// const pingHeroku = require(path.join(__dirname, "/../", "/ping-heroku.js"));
// pingHeroku("https://mini-fridge.herokuapp.com", 900000);	// every 900 seconds, or 15 minutes

// GRIDFS
let GridFsStorage = require("multer-gridfs-storage");
let Grid = require("gridfs-stream");

// INSTANTIATE APP 	
const app = express();
const router = express.Router();

// GridFS file storage
let gfs;
let conn = mongoose.connection;	// get db connection
conn.on('connected', () => {
	// initialize stream from GFS to mongodb
	gfs = new mongoose.mongo.GridFSBucket(conn.db, {
		bucketName: 'uploads'
	});
	console.log("mongoose.connection:", conn);
	
});

const storage = new GridFsStorage({
	url: process.env.MONGOLAB_URI,
	file: (req, file) => {

		// define file id
		const newID = uuid();	// generate new uuid
		uuid.isUUID(newID);	// validate uuid v4 format
		//console.log("new file UUID: ", newID);
		const fileId = newID; 
		console.log("gridfs storage file id", fileId);


		// file info record to be saved
		return new Promise((resolve, reject) => {
			const fileInfo = {
				filename: fileId,	// grid doc 'filename' key contains file id
				bucketName: 'uploads'
			};
			resolve(fileInfo);
		})
	}
})

const upload = multer({ storage });	// name of file input field is 'fileData'

router.post("/uploadFileGridFS", upload.single('fileData'), (req, res) => {

	//upload(req, res, function(err) {
		// request object is record in gfs file collection, bucketName 'uploads'

		//if (err) {
		//	console.log("GridFS file upload error");
		//}

		// console.log("gridfs upload file request object: ", req);

		const file = req.file;
		const fileId = file.filename;	// filename in gfs doc is file id
		const username = req.body.user;
		// console.log("req body", req.body);
		console.log("request obj:", file);
		console.log("user:", username);
		console.log("file id:", fileId);

		console.log("connected to database in route uploadFile");

		Users
			.findOne({user: username})
			.then(userDoc => {

				// file validation: users have no more than numFiles
				const numFiles = 5;
				if (userDoc.file_records.length >= numFiles) {
					console.log(`${userDoc.user} has 5 files already`);
					
					res.json({success: false});
					return	// terminates this function
				}
				
				// save file info to user collection
				const fileRec = {
					file_id: fileId,
					file_name: file.originalname
				}

				// save file transaction record to user collection
				const fileTransaction = {
					file_id: fileId,
					action: "UPLOAD"
				}

				userDoc.file_records.push(fileRec);
				userDoc.file_transactions.push(fileTransaction);
				
				console.log(`${userDoc.user}'s user record: `, userDoc);

				userDoc
					.save()
					.then(console.log(`file id ${fileId} saved to user ${userDoc.user}`));
				
				var responseObj = {
					success: true,
					file_name: fileRec.file_name,
					file_id: fileRec.file_id
				}

				res.json(responseObj);				

			})
			.catch( err => console.log("error finding user to save file:", err));
	
	
	//});

});

router.get("/downloadFileGridFS", (req, res)=> {

	const username = req.query.user;
	const fileId = req.query.fileId;
	const fileName = req.query.fileName;

	const fileExtension = path.extname(fileName);
	const mimeType = mime.lookup(fileExtension);

	console.log("user: ", username);
	console.log("frontend fileId:", fileId);
	console.log("frontend fileName:", fileName);
	console.log("frontend extension:", fileExtension);
	console.log("mime-type:", mimeType);
	// console.log("file id type:", typeof fileId);

	Users.findOne({user: username})
		.then(userDoc => userDoc.file_records)
		.then((fileRecordsArray) => {

			// validate that file id is in user record
			// TASK: maybe change array into object for faster retrieval?
			// const fileRecordsArray = userDoc.file_records;

			// loop through to verify that file belongs to user
			for (var i=0; i < fileRecordsArray.length; i++) {
				const fileRecord = fileRecordsArray[i];
				
				// console.log('--------');
				console.log("fileId", fileId);
				console.log("fileId type", typeof fileId);
				console.log("fileRecord.file_id", fileRecord.file_id);
				console.log("fileRecord.file_id type", typeof fileRecord.file_id);
				// console.log('--------');
				
				if (fileId == fileRecord.file_id) {
					
					// set response header before stream
					res.set({
								'Accept-Range': 'bytes',
								'Content-Disposition': 'attachment; filename=' + fileName,
								'Content-Type': mimeType,

					});

					// console.log("response object:", res);
					
					// define download and fs write streams
					var gfsDownloadStream = gfs.openDownloadStreamByName(fileId);	// gridfs filename is file ID
					
					// alternative: pipe to fs writestream for greater control, but no download prompt on front-end
					// var writestream = fs.createWriteStream(path.join(__dirname, 'downloaded', fileName));	// output file name 
					// gfsDownloadStream.pipe(writestream)	// would bypass prompt in front-end
					
					gfsDownloadStream.pipe(res);

					gfsDownloadStream.on('finish', () => {
							console.log('gfs download stream success');
					});

					gfsDownloadStream.on('error', (err) => {
							console.log('error with gfs download stream:');
					});					

				} else {
					console.log("gfs file id does not equal file record file id");
					console.log("file id not found in user's records")
					/// console.log("gfs file id:", fileId);
					/// console.log("file record file id:", fileRecord.file_id);
				}

			}
		})
		.catch(err => () => {
			console.log("User could not be found in database");
			res.status(400).json({ error: "User not found" });
		});  


});

router.get("/deleteFileGridFS", (req, res) => {

	const username = req.query.user;
	const fileId = req.query.fileId;
	console.log("user:", username);
	console.log("fileId:", fileId);

	// delete file id from user doc's file records
	Users.findOne({ user: username })
		.then( (userDoc) => {
			const fileRecordsArray = userDoc.file_records;
			console.log("fileRecordsArray:", fileRecordsArray);

			for (var i=0; i < fileRecordsArray.length; i++) {
				const fileRecord = fileRecordsArray[i];
				console.log("fileRecord:", fileRecord);
				if (fileId == fileRecord.file_id) {
					fileRecordsArray.splice(i, 1);	// remove record 
					userDoc.file_records = fileRecordsArray;	// replace with array with removed file reference
					console.log("updated user file records:", userDoc.file_records);
				}
			}

			// add delete record to transaction history 
			const fileTransaction = {
				file_id: fileId,
				action: "DELETE"
			};

			userDoc.file_transactions.push(fileTransaction);
			console.log(`updated user file transactions: ${userDoc.file_transactions}`);

			// save update user doc to db
			userDoc
				.save()
				.then( console.log(`file id ${fileId} deleted from user record ${userDoc.user}`))
				.catch(err => console.log("user doc could not be saved after updates:", err));

		})
		.then(() => {

			// delete from GridFS collection 'uploads'
			// find record with fileId, then delete using unique id from corresponding record in gfs files collection
			gfs.find({ "filename": fileId }).toArray((err, files) => {
				
				var gfsFileId = files[0]._id;
				console.log("gfs file id:", gfsFileId);

				// delete file given gfs file id
				gfs.delete(gfsFileId, (err) => {
					if (err) {
						console.log("error deleting gfs record:", err);
					} else {
						console.log("gfs record successfully deleted");
					}

				});

			});
			
		})
		.then(
			res.json({
				success: true,
				file_id: fileId,
			})
		)
		.catch( (err) => console.log("error with deleting from file record from user doc:", err) );

});




// PROCESS REQUESTS
// process file upload using multer
/*
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'files')
	},	
	filename: function(req, file, cb) {
		// generate unique id at app level
		// uuid: https://www.mongodb.com/blog/post/generating-globally-unique-identifiers-for-use-with-mongodb
		const newID = uuid();	// generate new uuid
		uuid.isUUID(newID);	// validate uuid v4 format
		//console.log("new file UUID: ", newID);
		const newFileName = newID + path.extname(file.originalname);	// use path to grab file extension
		//console.log("new file name: ", newFileName);

		cb(null, newFileName)
	}
})

*/


router.post("/uploadFile", (req, res) => {
	
	// uploads file first
	// accesses user record to see if x files or under
	// saves info in file and user collections

	var upload = multer({ storage: storage }).single("fileData");	// fieldname of front-end component is 'fileData'
	
	upload(req, res, function(err) {
		// for multer, route to router variable instead of app because of "/api" middleware at bottom
		const file = req.file;
		const fileId = path.basename(file.filename, path.extname(file.filename));	// grabs file id from path of hard copy
		const username = req.body.user;
		console.log("user:", username);
		console.log("file:", file);
		console.log("file object type:", typeof file);
		console.log("file id:", fileId);

		console.log("connected to database in route uploadFile");

		Users
			.findOne({user: username})
			.then(userDoc => {

				// create file object for db
				file.file_id = fileId;	// add file id to record
				const fileRecord = new Files(file);
				console.log("fileRecord:", fileRecord);

				// file validation: users have no more than numFiles
				const numFiles = 5;
				if (userDoc.file_records.length >= numFiles) {
					console.log(`${userDoc.user} has 5 files already`);
					
					// delete file already uploaded to "/file" dir
					// https://stackoverflow.com/questions/49099744/nodejs-multer-diskstorage-to-delete-file-after-saving-to-disk
					unlinkAsync(file.path);
					console.log(`deleted ${fileRecord._id} from files directory`)

					res.json({success: false});
					return	// terminates this function
				}
				
				// TASK: specify fileRecord._id to be fileId
				// proceed with saving file info to file and user collections
				fileRecord
					.save()
					.then(fileDoc => {
						console.log("file record added to db:", fileDoc);

						// save file info to user collection
						const fileRec = {
							file_id: fileId,
							file_name: fileDoc.originalname
						}

						// save file transaction record to user collection
						const fileTransaction = {
							file_id: fileId,
							action: "UPLOAD"
						}

						userDoc.file_records.push(fileRec);
						userDoc.file_transactions.push(fileTransaction);
						
						// console.log(`${userDoc.user}'s user record: `, userDoc);

						userDoc
							.save()
							.then(console.log(`file id ${fileId} saved to user ${userDoc.user}`));
						
						var responseObj = {
							success: true,
							file_name: fileRec.file_name,
							file_id: fileRec.file_id
						}
						
						res.json(responseObj);

					})
					.catch(error => console.log("error saving file to db:", error))


			})
			.catch( err => console.log("error finding user to save file:", err));
	
	});

});


router.get("/deleteFile", (req, res) => {

	// retrieve user and file collections based on request's user and file id
	// add to user's transaction history

	const username = req.query.user;
	const fileId = req.query.fileId;

	console.log("delete request user:", username);
	console.log("delete request fileId:", fileId);

	Users.findOne({user: username}).then( userDoc => {
		if (!userDoc) {
			console.log("user not found");
			res.status(400).json({ error: "User not found" });
			return
		}

		// delete record in file records of specified file id
		const fileRecordsArray = userDoc.file_records;

		// loop through to find and delete record of file
		// TASK: change to object for faster retrieval? 
		for (var i=0; i < fileRecordsArray.length; i++) {
			const fileRecord = fileRecordsArray[i];
			if (fileId === fileRecord.file_id) {
				fileRecordsArray.splice(i, 1);
				userDoc.file_records = fileRecordsArray;	// replaced doc's file records with spliced array 
				console.log("updated user file records:", userDoc.file_records)
			}
		}

		// add transaction indicating delete of file
		// userDoc.file_transactions.push();
		const fileTransaction = {
			file_id: fileId,
			action: "DELETE"
		};

		userDoc.file_transactions.push(fileTransaction);
		console.log(`updated user file transactions: ${userDoc.file_transactions}`)

		userDoc
			.save()
			.then(console.log(`file id ${fileId} deleted from user record ${userDoc.user}`))
			.catch(err => console.log("user doc could not be saved after updating file transaction:", err));
		
		// delete hard file from files directory
		// shallow delete from user records
		Files.findOne({file_id: fileId}).then( fileDoc => {

			console.log("fileDoc:", fileDoc);
			unlinkAsync(fileDoc.path);
			console.log(`hard copy of ${fileDoc.file_id} has been deleted from files directory`);

			// shallow delete record from files collection?
			fileDoc.is_deleted = true

			// save updated file record to files collection
			fileDoc
				.save()
				.then(console.log(`${fileDoc.file_id} has been shallow deleted`))
				.catch(console.log(`updated ${fileDoc.file_id} with shallow delete could not be saved`))

			res.json({ success: true, file_id: fileDoc.file_id});

		})
		.then(() => res.json({ success: true, file_id: fileDoc.file_id }))
		.catch(err => console.log(`${username} file could not be found`));

	})
	.catch(err => console.log("user could not be found in db", err));



});


router.get("/downloadFile", (req, res)=> {
	
	const username = req.query.user;
	const fileId = req.query.fileId;

	console.log("download file for user: ", username);
	console.log("download file for file id:", fileId);
	console.log("file id type:", typeof fileId);

	Users.findOne({user: username}).then(userDoc => {
		if (!userDoc) {
			console.log("user not found");
			res.status(400).json({ error: "User not found" });
			return
		}

		// validate that file id is in user record
		// TASK: maybe change array into object for faster retrieval?
		const fileRecordsArray = userDoc.file_records;
		const hasRecord = false;
		// loop through to verify that file belongs to user
		for (var i=0; i < fileRecordsArray.length; i++) {
			const fileRecord = fileRecordsArray[i];
			if (fileId === fileRecord.file_id) {
				//hasRecord = true;
				
				// retrieve record in file records of specified file id
				Files.findOne({file_id: fileId}).then( fileDoc => {

					console.log("fileDoc:", fileDoc);

					// serve file for download using stream
					var readable = fs.createReadStream(fileDoc.path);	// create read stream from file src dir
					var mimeType = mime.lookup(fileDoc.path);
					console.log("MIME-type: ", mimeType);

					readable.on("open", () => {
						res.set('Content-Type', mimeType);
						readable.pipe(res);
					})

					readable.on("error", (err) => {
						res.end({ success: false, error: err });
					})

				})
				.catch(err => console.log("file could not be found in db"));
			}
		}

	})
	.catch(err => "User could not be found in database");  


	

});

// @route POST api/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {

	// print out user inputs
	const username = req.body.user;
	const password = req.body.password;
	const passwordConfirm = req.body.passwordConfirm;
	console.log("register route")
	console.log("register user:", username);
	console.log("register raw password:", password);
	console.log("register raw password confirm:", passwordConfirm);

	// validate user inputs
	const { errors, isValid } = validateRegisterInput(req.body)	// validates user, password, passwordConfirm

	if (!isValid) {
		return res.status(400).json(errors);
	}

	Users.findOne({ user: username }).then(doc => {
		if (doc) {
			console.log("there is already a user with this username");
			return res.status(400).json({error: "there is already a user with this username"});
		} else {		
			// add user if existing user record not found
			const userObj = {
						user: username,
						password: password
					}		
			const userRecord = new Users(userObj);


			// hash password
			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(userRecord.password, salt, (err, hash) => {
					if (err) throw err;
					userRecord.password = hash;
					console.log("user's hashed password:", hash);

					// save user record in db
					userRecord
						.save()
						.then(d => {
							console.log("new user added to database:", d)
							res.json({ success: true });
						})
						.catch(err => {
							console.log("could not save user:", err)
							res.json({ 
								success: false,
								error: err
							});
						});

				});
			});

		}

	});

});

// @route POST api/login
// @desc User sign in, return token
// @access Public

router.post("/login", (req, res) => {


	// TASK BOOKMARK: add password, credential validation

	const username = req.body.user;
	const password = req.body.password;

	console.log("sign in route");
	console.log("user attempting to sign in:", username);
	console.log("user password input:", password);


	Users.findOne({ user: username }).then(userDoc => {
		if (!userDoc) {
			console.log("login user not found")
			res
				//.status(400)
				.json({ error: "User is not found"});
			
		} else {


			// validate password
			bcrypt.compare(password, userDoc.password).then(isMatch => {
				if (isMatch) {
					// retrieve file names of user record's files ref array
					// send file names 
					// TASK: perhaps send an object of a file's name and id, so that it can be uniquely identified from front-end especially for deleting and downloading 
					const fileRecordsArray = userDoc.file_records;
					// extract file name and id from each file record into new array of records
					const fArray = fileRecordsArray.map( (fileRecord) => { 
														
														const fileObj = { 
															fileName: fileRecord.file_name,
															fileId: fileRecord.file_id
														}

														return fileObj;

													});	
					console.log("login user record:", userDoc);
					console.log(`array of ${username} file records:`, fArray);

					res.json({
						success: true,
						fileRecordsArray: fArray
					});

					/*
					// create payload for found user
					const payload = {
						id: userDoc.id,
						name: userDoc.user
					}

					// response: send sign token, file names array
					jwt.sign(
						payload,
						keys.secretOrKey,
						{
							expiresIn: 604800	// 7 days in seconds
						},
						(err, token) => {
							// send response of token and file names array
							res.json({
								success: true,
								fileNamesArray: fArray,
								token: "Bearer " + token
							});
						}
					); 
					*/

				} else {
					// if password input does not match that of userDoc
					return res
							//.status(400)
							.json({
								success: false,
								error: "password incorrect"
							});
				}
			})




		}

	});
});


/*
// for when components mount in front-end?

router.get("/getFiles", (req, res)=> {
	// get files for particular user from database 
	// loads list of files on front-end

	console.log("connected to database in route getFiles");

	const user = req.query.user;

	// retrieve array of file ids from user
	Users
		.findOne({user: user})
		.then(userDoc => {
			const fileidsArray = userDoc.file_records;

			const resArray = fileidsArray.map( fileRecord => return fileRecord.file_name )	// extract file name from each file record and add to array
			console.log(`array of ${user} file names:`, resArray);
			//req.json({resArray})


		})
		.catch(err => console.log(`array of file ids for ${user} could not be found`));

	// map each file id to file name

	// send array of files names to front-end



	});

	

});


*/

module.exports = router;