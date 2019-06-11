const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
const multer = require("multer");	// package for processing binary data of uploaded files
const uuid = require("uuid-v4");
const path = require("path");

const Users = require("./models/users.js");
const Files = require("./models/files.js");	// does path work?

// INSTANTIATE APP 	
const app = express();
const router = express.Router();
const api_port  = 3001;


// ACCESS DATABASE
/*
const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb+srv://admin:HkoB3WcGJvwjcdvH@cluster0-baqzp.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  //const collection = client.d	b("test").collection("devices");
  // perform actions on the collection object
  console.log("connected to mongodb!");

  client.close();
});

*/

// MongoDB Atlas for Node 2.2.12 or later; can connect using VPN, but must whitelist IP of current connection
const dbRoute = "mongodb://admin:HkoB3WcGJvwjcdvH@cluster0-shard-00-00-baqzp.mongodb.net:27017,cluster0-shard-00-01-baqzp.mongodb.net:27017,cluster0-shard-00-02-baqzp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true"
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
var upload = multer({ storage: storage });

router.post("/uploadFile", upload.single("fileData"), (req, res) => {
	// for multer, route to router variable instead of app because of "/api" middleware at bottom
	const file = req.file;
	const filename = file.filename;
	console.log("file:", file);
	console.log("file object type:", typeof file);
	console.log("file name:", filename);


	// connect to db 
	const dbRoute = "mongodb://admin:HkoB3WcGJvwjcdvH@cluster0-shard-00-00-baqzp.mongodb.net:27017,cluster0-shard-00-01-baqzp.mongodb.net:27017,cluster0-shard-00-02-baqzp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true"
	mongoose.connect(
		dbRoute,
		{useNewUrlParser: true}
	);

	var db = mongoose.connection;
	db.on("error", console.error.bind(console, "db connection error: "));

	// insert file object containing meta-data into db
	db.once("open", function() {

		// TASK: change File schema to match with multer file object?

		console.log("connected to database in route uploadFile");

		const fileRecord = new Files(file);
		console.log("fileRecord:", fileRecord);
		fileRecord.save(function(err, doc){
			if (err) return console.error(err);
			// saved
			console.log("file record added to db:", doc);
		});
	});

	// TASK: DB add to userfiles/users collection (separate module?)
	// query user in userfiles db collection (or combine with users record?)
	// add file object, includes filename + pretty filename (file.originalname)
	// verify user is logged in? (or validate elsewhere?) if logged_in from users collection
	// append req file object to user record

	// query user in collection, then insert file id or file object

	// res.send("file response");
	res.send({success: true});
	return

});
	

router.post("/register", (req, res) => {

	const username = req.body.user;
	console.log("register route")
	console.log("register user:", username);

	Users.findOne({ user: username }).then(doc => {
		if (doc) {
			return res.status(400).json({user: "there is already a user with this username"});
		} else {		
			// add user if existing user record not found
			const userObj = {
						user: username,
						password: null,
						logged_in: false
					}		
			const userRecord = new Users(userObj);

			userRecord
				.save()
				.then((d) => {
					console.log("new user added to database:", d)
					res.json({success: true});
				})
				.catch(err => {
					console.log("could not save user:", err)
					res.json({success: false});
				});
		}

	});


});

router.post("/signIn", (req, res) => {

	const username = req.body.user;
	console.log("sign in route");
	console.log("user attempting to sign in:", username);

	Users.findOne({ user: username }).then(doc => {
		if (doc) {
			console.log("login user found: ", doc.user);
			// TASK: also send files of particular user
			// retrieve file ids [or pretty names from file objects] of user record's files ref array
			res.json({success: true});
		} else {
			console.log("login user not found")
			res.json({success: false});
		}

	});
});


/*

router.get("/getFiles", (err, req, res)=> {
	// get files for particular user from database 
	// loads list of files on front-end

	console.log("connected to database in route getFiles");

	// create instance of model?
	const users = new Users();

	// TASK: retrieve file ids [or pretty names from file objects] of user record's files ref array
	users.find({}).then()	//


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



