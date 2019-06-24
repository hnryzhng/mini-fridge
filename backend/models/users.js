const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema(
	{ 
		//_id: Number,	// is auto-generated
		user: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		logged_in: {
			type: Boolean,
			default: false
		},
		file_records: [{
				file_id: String,
				file_name: String
		}],
		file_transactions: [{	// record of interactions with a file
				file_id: String,
				action: String,	// actions: DOWNLOAD, UPLOAD, DELETE, EDIT
				timestamp: {
					type: Date,
					default: Date.now
				}
		}]
	}
);

module.exports = mongoose.model("Users", userSchema, "users");	// third param is collection name