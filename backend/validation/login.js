const Validator = require("validator");
const isEmpty = require("is-empty");

const validateLoginInput = function (data) {
	let errors = {};

	// Assign empty strings to empty fields for validator
	data.user = !isEmpty(data.user) ? data.user : "";
	data.password = !isEmpty(data.password) ? data.password : "";

	// Check user
	if (Validator.isEmpty(data.user)) {
		errors.user = "Must fill in username";
	}

	// Check password
	if (Validator.isEmpty(data.password)) {
		errors.password = "Must type in your password";
	}

	return {
		errors,
		isValid: isEmpty(errors)
	}

}

module.exports = validateLoginInput;