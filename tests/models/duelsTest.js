'use strict';

require("../../models/quizModel.js");
require("../../models/duelModel.js");

var should = require('should'),
	mongoose = require('mongoose'),
	Quiz = mongoose.model('Quiz'),
	Duel = mongoose.model('Duel');

describe('Duel Model', function() {

	describe('Saving', function() {
		it('saves a new duel', function(done) {

			var quiz = new Quiz({
				questions: ['idq1', 'idq2', 'idq3', 'idq4', 'idq5'],
		        answers1: [1,1,1,1,1],
		        answers2: [1,1,1,1,1]
			});

			var duel = new Duel({
				user1ID: 'ID1',
		        user2ID: 'ID2',
		        quizzes: [quiz.id, quiz.id, quiz.id],
		        user1Score: [],
		        user2Score: []
			});
			
			duel.validate(function(err, saved) {
                should.not.exist(err);
                done();
            });

		});

	});

});
