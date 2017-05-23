'use strict';

var users = require('../controllers/userController');
var errorHandler = require('../modules/errorHandler');

var put = function(req, res) {
    var found = false;
    var i = 0;
    users.getByUsername({'googleUsername': req.body.username}, function(err, user) {
        if (err && err.status == 400) {
            errorHandler(res, err);
        } else if (err && err.status == 404) { // new user
            users.create({
                'element': {
                    'googleUsername': req.body.username,
                    'devices': [{
                        'deviceID': req.body.deviceID,
                        'token': req.body.token
                    }]
                }
            }, function(err, user) {
                    res.status(201).send();
                });
        } else { // existing user
            for(i; i < user.devices.length && !found; i++) {
                // look for an existing deviceID corresponding to the current one
                found = (user.devices[i].deviceID == req.body.deviceID);
            }
            if (found && user.devices[i - 1].token == req.body.token) {
                res.send();
            } else {
                if (found && user.devices[i - 1].token != req.body.token) {
                    user.devices[i - 1].token = req.body.token;
                } else {
                    user.devices.push({
                        'deviceID': req.body.deviceID,
                        'token': req.body.token
                    });
                }

                users.update({
                    'elementID': user.id,
                    'element': user
                }, function(err, user) {
                    if(err) {
                        errorHandler(err);
                    } else {
                        res.send();
                    }
                });
            }
        }
    });
};

module.exports = put;
