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

// test register and sign in (complete process of registering, signing in)
// register userx, sign in: "userx successfully registered"
// sign in fail: "userx was not found"
// login fail if password or username is incorrect


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