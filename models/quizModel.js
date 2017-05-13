var quizModel = (function () {
	
	var mongoose = require('mongoose');

	return  {
		getSchema: function() {
			return new mongoose.Schema({
				questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
			});
		},
		getModel: function() {
			return mongoose.model('Quiz', this.getSchema());
		}
	};

})();
