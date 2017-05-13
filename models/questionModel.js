var questionModel = (function () {
	
	var mongoose = require('mongoose');

	return  {
		getSchema: function() {
			return new mongoose.Schema({
				question: String,
				topic: String,
				difficulty: {
					type: Number,
					min: 1,
					max: 3
				},
				trueOrFalse: Boolean,
				options: [{ option_id: {type: Number, min: 1, max: 4}, option: String}],
				answer: {
					type: Number
					min: 1,
					max: 4
				}
			});
		},
		getModel: function() {
			return moongose.model('Question', this.getSchema());
		}
	};

})();
