'use strict';

var Duel = (function () {

	var mongoose = require('mongoose');

    var getSchema = function() {
        return new mongoose.Schema({
            user1_id: {type: String, required: true},
            user2_id: {type: String, required: true},
            quizzes: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quiz',
                required: true
            }]
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
