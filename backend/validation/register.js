const Validator = require("validator");
const isEmpty = require("is-empty");

const validateRegisterInput = function(data) {
	let errors = {};

	// Assign empty strings to empty fields to use validator
	data.user = !isEmpty(data.user) ? data.user : "";
	data.password = !isEmpty(data.password) ? data.password : "";
	data.passwordConfirm = !isEmpty(data.passwordConfirm) ? data.passwordConfirm : "";

	// check user
	if (Validator.isEmpty(data.user)) {
		errors.user = "Please fill in username";
	}

	// check password
	if (Validator.isEmpty(data.password)) {
		errors.password = "Please type your password";
	}

	if (Validator.isEmpty(data.passwordConfirm)) {
		errors.passwordConfirm = "Please type password again for confirmation";
	}

	if (!Validator.isLength(data.password, { min: 8, max: 30} )) {
		errors.password = "Your password must be between 8 to 30 characters";
	}

	if (!Validator.equals(data.password, data.passwordConfirm)) {
		errors.passwordConfirm = "Your passwords must match";
	}

	return {
		errors,	// object filled with errors	
		isValid: isEmpty(errors)	// is valid only if there are no errors in errors obj
	}

};

module.exports = validateRegisterInput;