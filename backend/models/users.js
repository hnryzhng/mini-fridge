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
		file_ids: Array,	// list of file ids
		file_transactions: [{	// record of interactions with file
				file_id: String,
				action: String,	// download, upload, delete, edit
				timestamp: {
					type: Date,
					default: Date.now
				}
		}]
	}
);

module.exports = mongoose.model("Users", userSchema, "users");	// third param is collection name