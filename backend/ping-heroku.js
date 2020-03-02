// Heroku App Pinger

// prevent Heroku app from sleeping in free dynos mode

var http = require('http');

function pingHeroku(appUrl, pingInterval) {
	setInterval(function() {
		http.get(appUrl);	
	}, pingInterval);	// interval between pings in milliseconds
};

module.exports = pingHeroku;