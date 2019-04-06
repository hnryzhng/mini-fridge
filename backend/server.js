const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");

const app = express();
const router = app.Router();
const backendPort  = 3001;

const dbRoute = "";
mongoost.connect(
	dbRoute,
	{userNewUrlParser: true}
);

let db = mongoose.connection;
db.once("open", ()=> console.log("connected to database"));
db.on("error", console.error.bind(console, "db connection error: "));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
app.use(logger("dev"));

// PROCESS REQUESTS
router.get('/uploadFile', function(req, res){
	// 




});

//app.use("/api", router);

app.listen(api_port, () => console.log(`Listening to ${api_port}`));



