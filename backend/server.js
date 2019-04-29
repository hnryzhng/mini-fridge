const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
const multer = require("multer");	// package for processing binary data of uploaded files


const app = express();
const router = express.Router();
const api_port  = 3001;
/*
const dbRoute = "mongodb+srv://admin:minifridge@cluster0-baqzp.mongodb.net/test?retryWrites=true"
mongoose.connect(
	dbRoute,
	{useNewUrlParser: true}
);

let db = mongoose.connection;
db.once("open", ()=> console.log("connected to database"));
db.on("error", console.error.bind(console, "db connection error: "));
*/
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
//app.use(logger("dev"));

// process file upload using multer
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './files')
	},	
	filename: function(req, file, cb) {
		cb(null, file.fieldname)	// TASK: file name: corresponding file id from mongodb, or create here using UUID then send as response to front-end
	}
})
var upload = multer({ storage: storage });	// storage: storage

router.post("/uploadFile", upload.single("fileData"), (req, res) => {
	// for multer, route to router variable instead of app because of "/api" middleware at bottom
	// PROBLEM
	const file = req.file;
	//const name = req.file.filename;
	console.log("file:", file);

});





// PROCESS REQUESTS
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



