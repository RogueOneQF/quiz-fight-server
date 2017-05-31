'use strict';

var mongoose = require('mongoose');
var Quiz = require('../models/quizModel');

var crud = require('./crud')('Quiz');

module.exports = {
    create: crud.create,
    update: crud.update,
    delete: crud.delete,
    getByID: crud.getByID,
    list: crud.list,
    /**
     * Given an array of quiz ids, `getByIDsAndPopulate` returns the selected
     * quizzes populating the questions.
     */
    getByIDsAndPopulate: function(ids, callback) {
        Quiz.getModel().find({_id: {$in: ids}}).populate('questions').exec(function(err, quizzes) {
            if (err) {
                callback(crud.badRequest);
            } else if (!quizzes) {
                callback(crud.notFound);
            } else {
                callback(null, quizzes);
            }
        });
    }
};
