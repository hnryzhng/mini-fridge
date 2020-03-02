const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
const path = require("path");

// load environment variables
require("dotenv").config();

// ping Heroku
const pingHeroku = require(path.join(__dirname, "/ping-heroku.js"));
pingHeroku("https://mini-fridge.herokuapp.com", 1799000);	// every 1799 seconds, or almost 30 minutes (1800 sec)

// INSTANTIATE APP 	
const app = express();
// const router = express.Router();
const api_port  = process.env.PORT || 3001;

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


// SERVE FRONT-END SCRIPTS FOR HEROKU BUILD 
app.use(express.static(path.join(__dirname, "/../", "client", "build")));	// Adds the react production build to serve react requests

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "/../", "client", "build", "index.html"));
});


app.listen(api_port, () => console.log(`Listening to ${api_port}`));