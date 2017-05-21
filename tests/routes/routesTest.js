'use strict';

require("../../routes/routes.js");

const chai = require('chai'),
	chaiHttp = require('chai-http'),
	should = require('should'),
	server = require('../../quizFightServer.js');

chai.use(chaiHttp);

describe('POST /fight', () => {

	it('should create a new fight', (done) => {
		chai.request(server)
		.post('/fight')
		.send({topic1: 'General Knowledge', topic2: 'General Knowledge', topic3: 'General Knowledge', user1: 'idUser1', user2: 'idUser2'})
		.end((err, res) => {
			// there should be no errors
			should.not.exist(err);
			// there should be a 201 status code
			res.status.should.equal(201);
			// the response should be JSON
			res.type.should.equal('application/json');
			done();
		});
	});
});

