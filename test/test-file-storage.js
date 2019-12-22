// TASK BOOKMARK
// when testing routes, pay attention to localhost and Heroku routes

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

// call chai-http middleware
chai.use(chaiHttp);

// import files to be tested
const server = require('../backend/server.js');

// TESTS

// can submit file and store with any extension (e.g., doc, docx, xls, xlsx, pdf, txt, ...)
// cannot submit empty file 
// ensure two of the same files do not share same filename in files folder after uploading


// test retrieving user files
// user1: user1doc.doc, user1pdf.pdf
// user2: user2doc.doc, user2pdf.pdf, user2xls.xls
// user3: []


describe('feature a', function(done) {

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