'use strict';

var Question = (function () {

	var mongoose = require('mongoose');

    var getSchema = function() {
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
                type: Number,
                min: 1,
                max: 4,
                required: true
            }
        });
    };

    var model = mongoose.model('Question', getSchema());

	return  {
		getSchema: getSchema,
		getModel: function() {
			return model;
		}
	};

})();

module.exports = Question;
