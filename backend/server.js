const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
const multer = require("multer");	// package for processing binary data of uploaded files
const uuid = require("uuid-v4");
const path = require("path");

// load models for db schema
const Users = require("./models/users.js");
const Files = require("./models/files.js");

// load modules and packages for user authentication
const validateRegisterInput = require("./validation/register.js");
const validateLoginInput = require("./validation/login.js");

const bcrypt = require("bcryptjs");	// password encryption
const jwt = require("jsonwebtoken");	// validating endpoint transmissions 
const keys  = require("./config/keys.js");	// holds keys


// INSTANTIATE APP 	
const app = express();
const router = express.Router();
const api_port  = 3001;


// ACCESS DATABASE
// MongoDB Atlas for Node 2.2.12 or later; can connect using VPN, but must whitelist IP of current connection
const dbRoute = require("./config/keys.js").mongoURI;	//"mongodb://admin:HkoB3WcGJvwjcdvH@cluster0-shard-00-00-baqzp.mongodb.net:27017,cluster0-shard-00-01-baqzp.mongodb.net:27017,cluster0-shard-00-02-baqzp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true"
mongoose
	.connect(
		dbRoute,
		{useNewUrlParser: true}
	)
	.then(() => console.log("connected to MongoDB database"))
	.catch((err) => console.log("error connecting to MongoDB:", err));

//var db = mongoose.connection;
//db.on("error", console.error.bind(console, "db connection error: "));
//db.once("open", ()=> console.log("connected to database"));


// LOAD MIDDLEWARE
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
//app.use(logger("dev"));

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

	var upload = multer({ storage: storage }).single("fileData");	// fieldname of front-end component is 'fileData'

	upload(req, res, function(err) {
		// for multer, route to router variable instead of app because of "/api" middleware at bottom
		const file = req.file;
		const filename = file.filename;
		const username = req.body.user;
		console.log("user:", username);
		console.log("file:", file);
		console.log("file object type:", typeof file);
		console.log("file name:", filename);

		// TASK: change File schema to match with multer file object?

		console.log("connected to database in route uploadFile");

		const fileRecord = new Files(file);
		console.log("fileRecord:", fileRecord);
		fileRecord
			.save()
			.then(fileDoc => {
				console.log("file record added to db:", fileDoc);

				// add file id and file name to user record
				Users
					.findOne({user: username})
					.then(userDoc => {

						const fileRecord = {
							file_id: fileDoc.id,
							file_name: fileDoc.originalname
						}

						userDoc.file_ids.push(fileRecord);
						//TASK: userDoc.file_transactions
						
						console.log(`${userDoc.user}'s user record: `, userDoc);

						userDoc
							.save()
							.then(console.log(`file id ${fileDoc.id} saved to user ${userDoc.user}`));
						
						res.json({ success: true });

					})
					.catch(err => console.log("error finding user to save file:", err));

			})
			.catch(error => console.log("error saving file to db:", error));
		


		//});

		// TASK: DB add to userfiles/users collection (separate module?)
		// query user in userfiles db collection (or combine with users record?)
		// add file object, includes filename + pretty filename (file.originalname)
		// verify user is logged in? (or validate elsewhere?) if logged_in from users collection
		// append req file object to user record

		// query user in collection, then insert file id or file object

		// res.send("file response");
		//res.send({success: true});
		//return
	});

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
					const fileidsArray = userDoc.file_ids;	// TASK: change field in user model to filereferencesArray
					const fArray = fileidsArray.map( fileRecord => fileRecord.file_name );	// extract file name from each file record into new array
					console.log("login user record:", userDoc);
					console.log(`array of ${username} file names:`, fArray);

					res.json({
						success: true,
						fileNamesArray: fArray
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

router.get("/getFiles", (req, res)=> {
	// get files for particular user from database 
	// loads list of files on front-end

	console.log("connected to database in route getFiles");

	const user = req.query.user;

	// retrieve array of file ids from user
	Users
		.findOne({user: user})
		.then(userDoc => {
			const fileidsArray = userDoc.file_ids;

			const resArray = fileidsArray.map( fileRecord => return fileRecord.file_name )	// extract file name from each file record and add to array
			console.log(`array of ${user} file names:`, resArray);
			//req.json({resArray})


		})
		.catch(err => console.log(`array of file ids for ${user} could not be found`));

	// map each file id to file name

	// send array of files names to front-end



	});

	

});

router.get("/downloadFile", ()=> {
	
});

*/



/*
router.post('/uploadFile', function(req, res){	

	console.log("request", req.body);
	// receive validated user and file data
	// console.log("file name: ", req.name);
	// console.log("file data: ", req.file);

});
*/

app.use("/api", router);

app.listen(api_port, () => console.log(`Listening to ${api_port}`));



