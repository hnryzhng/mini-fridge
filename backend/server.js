const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
const multer = require("multer");	// package for processing binary data of uploaded files
const uuid = require("uuid-v4");
const path = require("path");

//const Users = require("./backend/models/users.js");
const Files = require("./models/files.js");	// does path work?

// INSTANTIATE APP 
const app = express();
const router = express.Router();
const api_port  = 3001;


// ACCESS DATABASE
const dbRoute = "mongodb+srv://admin:minifridge@cluster0-baqzp.mongodb.net/test?retryWrites=true"
mongoose.connect(
	dbRoute,
	{useNewUrlParser: true}
);

let db = mongoose.connection;
db.once("open", ()=> console.log("connected to database"));
db.on("error", console.error.bind(console, "db connection error: "));


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
	const filename = req.file.filename;
	console.log("file:", file);
	console.log("file name:", filename);

	// TASK: DB add to file collection record in mongoose
	const fileRecord = new Files(file);
	fileRecord.save(function(error){
		// TASK PRIORITY PROBLEM: CAN'T CONNECT TO CLOUD MONGODB
		if (error) {
			return error;
		};
		// saved
		console.log("file record added to db");
	});

	// TASK: DB add to userfiles/users collection (separate module?)
	// call userfiles db collection (or combine with users record?)
	// add file object, includes filename + pretty filename (file.originalname)
	// verify user is logged in? (or validate elsewhere?) if logged_in from users collection
	// append req file object to user record

	// res.send("file response");
	res.send({success: true});

});
	

/*
router.get("/getFile", ()=> {
	// get file from database  
	

}))
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



