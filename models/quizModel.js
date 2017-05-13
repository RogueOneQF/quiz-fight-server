'use strict';

var Quiz = (function () {

	var mongoose = require('mongoose');

	return  {
		getSchema: function() {
			return new mongoose.Schema({
				questions: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Question',
                    required: true
                }]
			});
		},
		getModel: function() {
			return mongoose.model('Quiz', this.getSchema());
		}
	};

})();
