'use strict';

require("../../models/questionModel.js");
require("../../models/quizModel.js");

var should = require('should'),
	mongoose = require('mongoose'),
	Question = mongoose.model('Question'),
	Quiz = mongoose.model('Quiz');

describe('Quiz Model', function() {

	describe('Saving', function() {
		it('saves a new quiz', function(done) {

			var question = new Question({
				question: 'Test Question',
				topic: 'Test Topic',
				difficulty: 1,
				trueOrFalse: false,
				options: [{option_id: 1, option: 'option 1'}, {option_id: 2, option: 'option 2'}, {option_id: 3, option: 'option 3'}],
				answer: 3
			});

			var quiz = new Quiz({
				questions: [question.id, question.id, question.id, question.id, question.id],
		        answers1: [1,1,1,1,1],
		        answers2: [1,1,1,1,1]
			});
			
			quiz.validate(function(err, saved) {
                should.not.exist(err);
                done();
            });

		});

		it('throws validation error when the number of questions is != 5', function(done) {

			var quiz = new Quiz({
				questions: [],
		        answers1: [1,1,1,1,1],
		        answers2: [1,1,1,1,1]
			});

			quiz.validate(function(err, saved) {
				should.exist(err);
				err.errors.questions.message.should.equal('questions is not the correct length');
			    done();
            });

		});

	});

});
