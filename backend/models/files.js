const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const filesSchema = new Schema(
	{
		//_id: Number,	// is auto-generated
		name: String,
		data: String,	// PROBLEM: include data, or store in directory with id as file name?
		active: Boolean	// active or inactive: accessed by a user or not
	},
	{ timestamps: true }
);

/*
OR
sample object generated when uploading file to multer
{
	fieldname: 'fileData',
	originalname: 'HenryZheng_Resume.pdf',
	encoding: '7bit',
	mimetype: 'application/pdf',
	destination: 'files',
	filename: '7251298f-fc01-4f9e-8045-0293fb7c2f59.pdf',
	path: 'files/7251298f-fc01-4f9e-8045-0293fb7c2f59.pdf',
	size: 61275 
}
*/

module.exports = mongoose.model("Files", filesSchema);