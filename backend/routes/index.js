const express = require("express");
const mongoose = require("mongoose");
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

const auth = require(path.join(__dirname, "/../", "middleware/auth.js"));	// load custom authentication middleware
const bcrypt = require("bcryptjs");	// password encryption


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
	// console.log("mongoose.connection:", conn);
	
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

router.post("/uploadFileGridFS", upload.single('fileData'), auth, (req, res) => {

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
				
				res.json({
					success: false,
					error: "You've already reached the limit of 5 files. Please delete files if you want to upload more."
				});
				// return	// terminates this function
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

});

router.get("/downloadFileGridFS", auth, (req, res)=> {

	console.log("req header x-access-token:", req.header('x-access-token'));

	// BOOKMARK
	console.log("decoded payload:", req.decoded);

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

router.get("/deleteFileGridFS", auth, (req, res) => {

	console.log("req header x-access-token:", req.header('x-access-token'));

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

	Users.findOne({ user: username }).then(doc => {
		if (doc) {
			console.log("there is already a user with this username");
			return res.json({
						success: false,
						error: "there is already a user with this username"
					});
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

							// user is now registered and logged in
							
							// generate authentication token (JWT) using custom method defined in User model
							const token = d.generateAuthToken();
							// send token in payload
							res.json({
								success: true,
								token: token
							});

							// res.json({ success: true });
						})
						.catch(err => {
							console.log("could not save user:", err)
							res.json({ 
								success: false,
								error: "could not save user"
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

					// generate authentication token (JWT) using custom method defined in User model
					const token = userDoc.generateAuthToken();
					
					// response: send token and file names array
					res.json({
						success: true,
						token: token,
						fileRecordsArray: fArray
					})

					/*

					res.json({
						success: true,
						fileRecordsArray: fArray
					});

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