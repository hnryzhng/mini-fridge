const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const DataSchema = new Schema(
	{
		fileName: String,
		fileId: String,
		fileData: String,	// PROBLEM
		status: String
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Files", DataSchema);