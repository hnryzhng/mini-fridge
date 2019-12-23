
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

describe('LOGIN route /api/login GET', function(done) {

	// VARS

	// HOOKS
	// before(function(done){}) OR beforeEach(function(done){})

	// after(function(done){}) OR afterEach(function(done){})

	// UNIT TESTS
	/**
	it('should ...', function(done) {

		// chai assertion styles: https://www.chaijs.com/guide/styles/

		// done();

	})
	**/

	it('should fail if incorrect username and correct password', function(done) {

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

	it('should fail if correct username and incorrect password', function(done) {

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

	it('should succeed if correct username and password', function(done) {

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


describe('REGISTER route api/register GET', function(done) {

	// VARS

	// HOOKS
	// before(function(done){}) OR beforeEach(function(done){})

	// after(function(done){}) OR afterEach(function(done){})

	it('should fail if incorrect username', function(done) {

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

	it.skip('should fail if invalid password', function(done) {

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


	it('should fail if incompatible password and confirmation password', function(done) {

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

	it('should succeed if correct username, password, confirm password', function(done) {

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