'use strict';

var mongoose = require('mongoose');
var Question = require('../models/questionModel');

var crud = require('./crud')('Question');

module.exports = {
    create: crud.create,
    update: crud.update,
    delete: crud.delete,
    getByID: crud.getByID,
    list: crud.list,
    getByTopic: function(filter, callback) {
        Question.getModel().find(filter, function(err, questions) {
            if (err) {
                callback(crud.badRequest);
            } else if (!questions) {
                callback(crud.notFound);
            } else {
                callback(undefined, questions);
            }
        });
    }
};
