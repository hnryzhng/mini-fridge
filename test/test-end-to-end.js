
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

// call chai-http middleware
chai.use(chaiHttp);

// import files to be tested
const server = require('../backend/server.js');

// TESTS

// TASK BOOKMARK
// when testing routes, pay attention to localhost and Heroku routes

// TASK: separate React components for individual testing

// TUTORIAL: https://www.freecodecamp.org/news/end-to-end-tests-with-selenium-and-docker-the-ultimate-guide/

// upload file
// can submit file and store with any extension (e.g., doc, docx, xls, xlsx, pdf, txt, ...)
// cannot submit empty file 
// ensure two of the same files do not share same filename (originalname) in user file records and gridfs files collection
// uploaded file shows up in front-end display

// delete file
// deleted file removed from display
// deleted file shows up in user transaction history, removed from user file records, removed from gridfs collections files and chunks 

// download file
// downloaded file has same name as file in db

describe('UPLOAD FILE', function(done) {

	// VARS

	// HOOKS
	// before(function(done){}) OR beforeEach(function(done){})

	// after(function(done){}) OR afterEach(function(done){})

	// UNIT TESTS
	it('should ...', function(done) {

		// chai assertion styles: https://www.chaijs.com/guide/styles/

		// done();

	})

	it('should return ... /route METHOD', function(done) {

		/**

		chai.request(server)
			.get('/test-route')
			.end(function(err, res){
				res.should.be.json;	// should return json response object
				res.should.have.status(200);	// should have status 200?
				res.body.should.have.property('success');	// should have success property
				res.body.should.have.property('dummyprop');	// dummy prop
				res.body.success.should.equal(true);	// success should return true
				res.body.dummyprop.should.equal('dummyval');	// dummy prop should equal dumm value
			
				done();
			});
		**/
	})

})