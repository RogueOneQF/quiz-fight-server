var duelModel = (function () {
	
	var mongoose = require('mongoose');

	return  {
		getSchema: function() {
			return new mongoose.Schema({
				user1_id: String,
				user2_id: String,
				quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }]
			});
		},
		getModel: function() {
			return mongoose.model('Duel', this.getSchema());
		}
	};

})();
