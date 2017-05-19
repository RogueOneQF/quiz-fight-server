'use strict';

var mongoose = require('mongoose');

module.exports = function(modelName) {

	var Model = mongoose.model(modelName);
    var notFound = {'status': 404, 'message': 'Not found'};
    var badRequest = {'status': 400, 'message': 'Bad request'};

	return {
        notFound: notFound,
        badRequest: badRequest,
		create: function(params, callback) {
            var elem = new Model(params.element);

			elem.save(function(err) {
				if (err) {
                    callback(badRequest);
				} else {
					callback(undefined, elem);
				}
			});
		},

		update: function(params, callback) {
			Model.findByIdAndUpdate(params.elementID, {
                $set: params.element
            },function(err, element) {
                if (err) {
                    callback(badRequest);
				} else if (!element) {
                    callback(notFound);
                } else {
					callback(undefined, element);
				}
			});
		},

		delete: function(params, callback) {
			Model.findByIdAndRemove(params.elementID, function(err, element) {
                if (err) {
                    callback(badRequest);
				} else if (!element) {
                    callback(notFound);
                } else {
					callback(undefined, element);
				}
			});
		},

		list: function(callback) {
			Model.find(function(err, elements) {
				if (err) {
					callback(badRequest);
				} else if (!elements) {
                    callback(notFound);
                } else {
					callback(undefined, elements);
				}
			});
		},

		getByID: function(id, callback) {
			Model.findById(id, function(err, element) {
                if (err) {
                    callback(badRequest);
				} else if (!element) {
                    callback(notFound);
                } else {
					callback(undefined, element);
				}
            });
		}
	};
};
