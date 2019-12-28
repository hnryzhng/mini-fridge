const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
// const multer = require("multer");	// package for processing binary data of uploaded files
// const uuid = require("uuid-v4");
const path = require("path");

// const fs = require("fs");
// const { promisify } = require("util");	// converts callback based fn to promise-based one for async control flow 
// const unlinkAsync = promisify(fs.unlink);	// convert fs unlink method to a function that yields Promise for async control 
// const mime = require("mime-types");

// load models for db schema
// const Users = require(path.join(__dirname, "/models/users.js"));
// const Files = require(path.join(__dirname, "/models/files.js"));

// load modules and packages for user authentication
// const validateRegisterInput = require(path.join(__dirname, "/validation/register.js"));
// const validateLoginInput = require(path.join(__dirname, "/validation/login.js"));

// const bcrypt = require("bcryptjs");	// password encryption
// const jwt = require("jsonwebtoken");	// validating endpoint transmissions 
// const keys  = require(path.join(__dirname, "/config/keys.js"));	// holds keys

// load environment variables
require("dotenv").config();

// ping Heroku
const pingHeroku = require(path.join(__dirname, "/ping-heroku.js"));
// pingHeroku("https://mini-fridge.herokuapp.com", 900000);	// every 900 seconds, or 15 minutes

// GRIDFS
// let GridFsStorage = require("multer-gridfs-storage");
// let Grid = require("gridfs-stream");

// INSTANTIATE APP 	
const app = express();
// const router = express.Router();
const api_port  = process.env.PORT || 3001;

// TASK
// MODULARIZE ROUTES

// TASK
// CREATE NEW DATABASE WITH NEW ACCESS URL AND HIDDEN KEY without GITHUB RECORD

// CONNECT TO DATABASE
const dbRoute = process.env.MONGOLAB_URI;
mongoose
	.connect(
		dbRoute,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true
		}
	)
	.then(() => console.log("connected to MongoDB database"))
	.catch((err) => console.log("error connecting to MongoDB:", err));


// LOAD MIDDLEWARE
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());


// LOAD ROUTES
// app.use("/api", router);
app.use("/api", require("./routes"));

/*
// SERVE FRONT-END SCRIPTS FOR HEROKU BUILD 
app.use(express.static(path.join(__dirname, "/../", "client", "build")));	// Adds the react production build to serve react requests

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "/../", "client", "build", "index.html"));
});
*/

app.listen(api_port, () => console.log(`Listening to ${api_port}`));