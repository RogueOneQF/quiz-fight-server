'use strict';

var Duel = (function () {

	var mongoose = require('mongoose');

	return  {
		getSchema: function() {
			return new mongoose.Schema({
				user1_id: {type: String, required: true},
				user2_id: {type: String, required: true},
				quizzes: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Quiz',
                    required: true
                }]
			});
		},
		getModel: function() {
			return mongoose.model('Duel', this.getSchema());
		}
	};

})();
