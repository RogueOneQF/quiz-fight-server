'use strict';

var should = require('should'),
	mongoose = require('mongoose'),
	Category = mongoose.model('Question');

describe('Question Model', function() {

	describe('Saving', function() {
		it('saves a new question', function(done) {
			var question = new Question({
				question: 'Test Question',
				topic: 'Test Topic',
				difficulty: 1,
				trueOrFalse: false,
				options: [{option_id: 1, option: 'option 1'}, {option_id: 2, option: 'option 2'}, {option_id: 3, option: 'option 3'}],
				answer: 3
			});

			category.save(function(err, saved) {
                should.not.exist(err);
                done();
            });

		});

		it('throws validation error when the trueOrFalse property is true and the answer is >= 2', function(done) {

			var question = new Question({
				question: 'Test Question',
				topic: 'Test Topic',
				difficulty: 1,
				trueOrFalse: true,
				options: null,
				answer: 3
			});

			category.save(function(err, saved) {
            should.exist(err);
            err.errors.name.message.should.equal('Invalid answer/question type combination');
            done();
            });

		});

	});

});
