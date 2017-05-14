'use strict';

var Quiz = (function () {

	var mongoose = require('mongoose');

    var getSchema = function() {
        return new mongoose.Schema({
            questions: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
                required: true
            }]
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
