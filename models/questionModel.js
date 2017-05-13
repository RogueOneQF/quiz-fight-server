'use strict';

function validateAnswer(question) {
    return (question.trueOrFalse)
        ? (question.answer < 2)
        : (question.answer > 0)
}

var Question = (function () {

	var mongoose = require('mongoose');

	return  {
		getSchema: function() {
			return new mongoose.Schema({
				question: {type: String, required: true},
				topic: {type: String, required: true},
				difficulty: {
					type: Number,
					min: 1,
					max: 3,
                    required: true
				},
				trueOrFalse: {type: Boolean, required: true},
				options: [{
                    option_id: {
                        type: Number,
                        min: 1,
                        max: 4,
                        required: true
                    },
                    option: {type: String, required: true}
                }],
				answer: {
					type: Number
					min: 0,
					max: 4,
                    required: true,
                    validate: {
                        validator: validateAnswer,
                        message: 'Invalid answer/question type combination'
                    }
				}
			});
		},
		getModel: function() {
			return moongose.model('Question', this.getSchema());
		}
	};

})();
