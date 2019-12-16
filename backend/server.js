const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
const multer = require("multer");	// package for processing binary data of uploaded files
const uuid = require("uuid-v4");
const path = require("path");

const fs = require("fs");
const { promisify } = require("util");	// converts callback based fn to promise-based one for async control flow 
const unlinkAsync = promisify(fs.unlink);	// convert fs unlink method to a function that yields Promise for async control 
const mime = require("mime-types");

// load models for db schema
const Users = require("./models/users.js");
const Files = require("./models/files.js");

// load modules and packages for user authentication
const validateRegisterInput = require(path.join(__dirname, "/validation/register.js"));
const validateLoginInput = require(path.join(__dirname, "/validation/login.js"));

const bcrypt = require("bcryptjs");	// password encryption
const jwt = require("jsonwebtoken");	// validating endpoint transmissions 
const keys  = require(path.join(__dirname, "/config/keys.js"));	// holds keys

// load environment variables
require("dotenv").config();

// INSTANTIATE APP 	
const app = express();
const router = express.Router();
const api_port  = process.env.PORT || 3001;

// SERVE FRONT-END SCRIPTS FOR HEROKU 
app.use(express.static(path.join(__dirname, "/../client/build")));	// Adds the react production build to serve react requests

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "/../client/build/index.html"));
});


// ACCESS DATABASE
// const dbRoute = require(path.join(__dirname, "/config/keys.js").mongoURI;	//"mongodb://admin:HkoB3WcGJvwjcdvH@cluster0-shard-00-00-baqzp.mongodb.net:27017,cluster0-shard-00-01-baqzp.mongodb.net:27017,cluster0-shard-00-02-baqzp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true"
const dbRoute = process.env.MONGOLAB_URI;
mongoose
	.connect(
		dbRoute,
		{useNewUrlParser: true}
	)
	.then(() => console.log("connected to MongoDB database"))
	.catch((err) => console.log("error connecting to MongoDB:", err));

// LOAD MIDDLEWARE
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

// PROCESS REQUESTS
// process file upload using multer
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

					/**
					only works for serving doc and xls files
					var dataStr = "";
					readable.on("data", (chunk) => {
						dataStr += chunk.toString();	// add chunk to response string 
						// res.write(chunk);	// send chunk in response
					});

					readable.on("end", () => {
						console.log("response string to be served:", dataStr);
						// console.log("file extension:", fileDoc.path);
						// console.log("mime type", mime.lookup(fileDoc.path));

						var responseObj = {
							payload: dataStr,	// send binary of complete data string
							mime_type: mime.lookup(fileDoc.path)	// send mime-type based on file extension
						}
						
						res.json(dataStr); 
					});

					readable.on("error", (err) => {
						res.end({ success: false, error: err })
					});
					**/

					/**
					res.download(fileDoc.path, (err) => {
						if (err) {
							console.log("error sending file for download at path:", fileDoc.path);
						} else {
							// add transaction history upon successful download
							const fileTransaction = {
								file_id: fileId,
								action: "DOWNLOAD"
							}
							userDoc.file_transactions.push(fileTransaction);
							console.log(`${userDoc.user} transactions: ${userDoc.file_transactions}`)
						}

					});
					**/

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


app.use("/api", router);

app.listen(api_port, () => console.log(`Listening to ${api_port}`));