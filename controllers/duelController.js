'use strict';

var mongoose = require('mongoose');
var Duel = require('../models/duelModel');
var quizzes = require('./quizController');

var crud = require('./crud')('Duel');

module.exports = {
    create: crud.create,
    update: crud.update,
    delete: crud.delete,
    getByID: crud.getByID,
    list: crud.list,
    /**
     * Given an array of duel ids and the requesting player's ID,
     * `getScoresByIDs` returns an array of scores totalized during the requested
     * duels. The result, or the error, is used a parameter for the `callback`
     * function.
     */
    getScoresByIDs: function(ids, playerID, callback) {
        var oids = ids.map(function(id) {
            return mongoose.Types.ObjectId(id);
        });
        Duel.getModel().find({_id: {$in: oids}}, function(err, duels) {
            if (err) {
                callback(crud.badRequest);
            } else if (!duels) {
                callback(crud.notFound);
            } else {
                callback(null, duels.map(function(element) {
                    return (element.user1ID == playerID) ? element.user2Score : element.user1Score;
                }));
            }
        })
    },
    /**
     * Given a duel ID, `getByIDAndPopulate` returns (via callback) the populated
     * duel, adding every information about quizzes and questions.
     */
    getByIDAndPopulate: function(id, callback) {
        Duel.getModel().findById(id).populate('quizzes').exec(function(err, duel) {
            if (err) {
                callback(crud.badRequest);
            } else if (!duel) {
                callback(crud.notFound);
            } else {
                quizzes.getByIDsAndPopulate(duel.quizzes, function(err, duelQuizzes) {
                    if (err) {
                        callback(crud.badRequest);
                    } else if (!duelQuizzes) {
                        callback(crud.notFound);
                    } else {
                        duel.quizzes = duelQuizzes;
                        callback(null, duel);
                    }
                });
            }
        });
    }
};
