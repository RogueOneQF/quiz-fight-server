'use strict';

var mongoose = require('mongoose');
var Duel = require('../models/duelModel');

var crud = require('./crud')('Duel');

module.exports = {
    create: crud.create,
    update: crud.update,
    delete: crud.delete,
    getByID: crud.getByID,
    list: crud.list,
    addRound: function(duelID, quizID, callback) {
        crud.getByID(duelID, function(err, duel) {
            if (err) {
                callback(crud.badRequest);
			} else if(!duel) {
                callback(crud.notFound);
            } else {
                duel.quizzes.push(quizID);
                crud.update({
                    'elementID': duelID,
                    'element': duel
                }, function(err, oldDuel) {
                    if (err) {
                        callback(crud.badRequest);
    				} else if (!oldDuel) {
                        callback(crud.notFound);
                    } else {
    					callback(undefined, duel);
    				}
                });
			}
        });
    }
};
