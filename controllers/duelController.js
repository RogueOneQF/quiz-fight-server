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
                    return (element.user1ID == playerID) ? element.user1Score : element.user2Score;
                }));
            }
        })
    }
};
