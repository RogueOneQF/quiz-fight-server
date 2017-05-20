'use strict';

var Duel = (function () {

	var mongoose = require('mongoose');

    var getSchema = function() {
        return new mongoose.Schema({
            user1ID: {type: String, required: true},
            user2ID: {type: String, required: true},
            quizzes: [{
		            type: mongoose.Schema.Types.ObjectId,
		            ref: 'Quiz',
		            required: true
			}],
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
