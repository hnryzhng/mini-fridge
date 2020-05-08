// Authentication middleware uses JWT to verify token from a request

const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
	// get token from header 

	const token = req.header("x-access-token") || req.header("authorization");

	// if no token, return response without proceeding to subsequent middleware or route
	if (!token) return res.status(401).send("Access denied. No token.");

	// if token exists, verify and move onto next middleware or route
	try {
		const decodedPayload = jwt.verify(token, process.env.PRIVATE_KEY);	// verify payload and decode using private key
		console.log("decoded payload:", decodedPayload);

		req.decoded = decodedPayload;

		next();	

	} catch(err) {
		// if decoded is undefined, invalid token
		res.status(400).send("Invalid token.");
	}
}