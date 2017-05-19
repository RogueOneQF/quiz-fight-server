'use strict';

var Quiz = (function () {

	var mongoose = require('mongoose');
	
	var arrayLength = function arrayLength(val) {
		return val.length == 5;
	};

    var getSchema = function() {
        return new mongoose.Schema({
            questions: {
				type: [{
		            type: mongoose.Schema.Types.ObjectId,
		            ref: 'Question',
		            required: true
		        }],
				validate: [arrayLength, '{PATH} is not the correct length']
			},
            answers1: [[{type: Number, min: 1, max: 4, required: true, default: []}]],
            answers2: [[{type: Number, min: 1, max: 4, required: true, default: []}]]
        });
    };

    var model = mongoose.model('Quiz', getSchema());

	return  {
		getSchema: getSchema,
		getModel: function() {
			return model;
		}
	};

})();

module.exports = Quiz;
