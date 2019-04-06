const mongoose = require("mongoose");

const Scehma = mongoose.Schema;
const DataSchema = new Schema(
	{
		user: String,
		fileIds: Array,	// list of file ids
		fileTransactions: Array	// record of interactions with file
	}
)

module.exports = mongoose.model("UserFiles", DataSchema);