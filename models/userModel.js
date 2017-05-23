'use strict';

var User = (function () {

	var mongoose = require('mongoose');

	var getSchema = function() {
        return new mongoose.Schema({
            googleUsername: {type: String, required: true},
            // different devices have different tokens
            devices: [{
                deviceID: {type: String, required: true},
                token: {type: String, required: true}
            }]
        });
    };

    var model = mongoose.model('User', getSchema());

	return  {
		getSchema: getSchema,
		getModel: function() {
			return model;
		}
	};

})();

module.exports = User;
