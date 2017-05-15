'use strict';

var mongoose = require('mongoose');

module.exports = function(modelName) {

	var Model = mongoose.model(modelName);

	return {
		create: function(req, res) {
            var element = new Model(req.body.element);

			element.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: "Bad request"
					});
				} else {
					res.status(201).json(element);
				}
			});
		},

		update: function(req, res) {
			Model.findByIdAndUpdate(req.body.element_id, {
                $set: req.body.element
            },function(err, element) {
				if (err) {
					return res.status(400).send({
						message: "Bad request"
					});
				} else {
					res.json(element);
				}
			});
		},

		delete: function(req, res) {
			Model.findByIdAndRemove(req.body.element_id, function(err, element) {
				if (err) {
					return res.status(400).send({
						message: "Bad request"
					});
				} else {
					res.json(element);
				}
			});
		},

		list: function(req, res) {
			Model.find(function(err, elements) {
				if (err) {
					res.status(400).send({
						message: "Bad request"
					});
				} else {
					res.json(elements);
				}
			});
		},

		getByID: function(req, res) {
			Model.findById(req.body.element_id, function(err, element) {
                if (err) {
                    res.status(400).send({
                        message: 'Bad request'
                    });
                } else if (!element) {
                    res.status(404).send({
                        message: modelName + ' not found'
                    });
                } else {
                    res.json(element);
                }
            });
		}
	};
};
