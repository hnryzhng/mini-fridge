const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const DataSchema = new Schema(
	{ 
		user: String,
		password: String
		logged_in: Boolean,
		files: Array,	// list of file ids
		file_transactions: [	// record of interactions with file
			{
				file_id: String,
				action: String,
				timestamp: Date
			}
		]
	}
);

module.exports = mongoose.model("Users", DataSchema);