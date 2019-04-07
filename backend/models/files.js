const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const DataSchema = new Schema(
	{
		_id: Number,
		name: String,
		data: String,	// PROBLEM
		active: Boolean	// active or inactive: accessed by a user or not
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Files", DataSchema);