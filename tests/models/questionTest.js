'use strict';

require('../../models/questionModel.js');

var should = require('should'),
	mongoose = require('mongoose'),
	Question = mongoose.model('Question');

describe('Question Model', function() {

	describe('Saving', function() {
		it('saves a new question', function(done) {
			var question = new Question({
				question: 'Test Question',
				topic: 'Test Topic',
				difficulty: 1,
				trueOrFalse: false,
				options: [{option_id: 1, option: 'option 1'},
						{option_id: 2, option: 'option 2'},
						{option_id: 3, option: 'option 3'}],
				answer: 3
			});

			question.validate(function(err, saved) {
                	should.not.exist(err);
                	done();
            });

		});

		it('throws validation error when the difficult property is > 3',
			function(done) {

				var question = new Question({
					question: 'Test Question',
					topic: 'Test Topic',
					difficulty: 4,
					trueOrFalse: true,
					options: null,
					answer: 3
				});

				question.validate(function(err, saved) {
					should.exist(err);
					done();
		        });

		});

	});

});
