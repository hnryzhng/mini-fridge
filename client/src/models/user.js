const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const DataSchema = new Schema(
	{ 
		user: String,
		password: String
		logged_in: Boolean		
	}
);

module.exports = mongoose.model("Users", DataSchema);