'use strict';

var mongoose = require('mongoose');
var User = require('../models/userModel');

var crud = require('./crud')('User');

module.exports = {
    create: crud.create,
    update: crud.update,
    delete: crud.delete,
    getByID: crud.getByID,
    list: crud.list,
    getByFilter: function(filter, callback) {
        User.getModel().findOne(filter, function(err, user) {
            if (err) {
                callback(crud.badRequest);
            } else if (!user) {
                callback(crud.notFound);
            } else {
                callback(undefined, user);
            }
        });
    }
};
