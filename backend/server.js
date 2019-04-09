const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
const multer = require("multer");	// package for processing binary data of uploaded files


const app = express();
const router = express.Router();
const api_port  = 3001;

const dbRoute = "mongodb+srv://admin:minifridge@cluster0-baqzp.mongodb.net/test?retryWrites=true"
mongoose.connect(
	dbRoute,
	{useNewUrlParser: true}
);

let db = mongoose.connection;
db.once("open", ()=> console.log("connected to database"));
db.on("error", console.error.bind(console, "db connection error: "));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
//app.use(logger("dev"));

// PROCESS REQUESTS
router.post('/uploadFile', function(req, res){
	
	// receive validated user and file data
	console.log("file name: ", req.name);
	console.log("file data: ", req.file);

});

app.use("/api", router);

app.listen(api_port, () => console.log(`Listening to ${api_port}`));



