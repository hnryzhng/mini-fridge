const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const filesSchema = new Schema(
	{
		_id: Number,
		name: String,
		data: String,	// PROBLEM: include data, or store in directory with id as file name?
		active: Boolean	// active or inactive: accessed by a user or not
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Files", filesSchema);