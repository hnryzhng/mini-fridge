// Heroku App Pinger

// prevent Heroku app from sleeping in free dynos mode

var http = require('http');

function pingHeroku(appUrl, pingInterval) {
	setInterval(function() {
		http.get(appUrl);	// url: https://hospital-cost-map.herokuapp.com/
	}, pingInterval);	// interval between pings in milliseconds
};

module.exports = pingHeroku;