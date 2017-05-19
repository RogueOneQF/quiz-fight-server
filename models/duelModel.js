'use strict';

var Duel = (function () {

	var mongoose = require('mongoose');

	var arrayLength = function arrayLength(val) {
		return val.length == 3;
	};

    var getSchema = function() {
        return new mongoose.Schema({
            user1ID: {type: String, required: true},
            user2ID: {type: String, required: true},
            quizzes: {
				type: [{
		            type: mongoose.Schema.Types.ObjectId,
		            ref: 'Quiz',
		            required: true
		        }],
				validate: [arrayLength, '{PATH} is not the correct length']
			},
            user1Score: [{type: Number, min: 0, required: true, default: []}],
            user2Score: [{type: Number, min: 0, required: true, default: []}]
        });
    };

    var model = mongoose.model('Duel', getSchema());

	return  {
		getSchema: getSchema,
		getModel: function() {
			return model;
		}
	};

})();

module.exports = Duel;
