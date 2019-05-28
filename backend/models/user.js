const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const usersSchema = new Schema(
	{ 
		//_id: Number,	// is auto-generated
		user: String,
		password: String
		logged_in: Boolean,
		file_ids: Array,	// list of file ids
		file_transactions: [{	// record of interactions with file
				file_id: String,
				action: String,	// download, upload, delete, edit
				timestamp: Date
		}]
	}
);
s
module.exports = mongoose.model("Users", usersSchema);