'use strict';

var users = require('../controllers/userController');
var errorHandler = require('../modules/errorHandler');

/**
 * Add the user's token to the database. The user is retrieved using her googleUsername
 * Games username. Furthermore, if the token has been sent using a registrated deviceID
 * the previous token is overridden.
 * @param req.body.username User's Games username
 * @param req.body.token User's device token
 * @param req.body.deviceID User's device unique ID
 * @return Nothing
 */
var put = function(req, res) {
    var found = false;
    var i = 0;
    // Get the user by her username
    users.getByFilter({'googleUsername': req.body.username}, function(err, user) {
        if (err && err.status == 400) {
            errorHandler(res, err);
        } else if (err && err.status == 404) { // new user --> add a document
            users.create({
                'element': {
                    'googleUsername': req.body.username,
                    'devices': [{
                        'deviceID': req.body.deviceID,
                        'token': req.body.token
                    }]
                }
            }, function(err, user) {
                    res.status(201).send(); // user correctly created
                });
        } else { // existing user
            for(i; i < user.devices.length && !found; i++) {
                // look for an existing deviceID corresponding to the current one
                found = (user.devices[i].deviceID == req.body.deviceID);
            }
            if (found && user.devices[i - 1].token == req.body.token) {
                // That's the same stored token. Do nothing
                res.send();
            } else { // A new token is going to be added
                if (found && user.devices[i - 1].token != req.body.token) {
                    // Override a previous token
                    user.devices[i - 1].token = req.body.token;
                } else {
                    // Create a new device element
                    user.devices.push({
                        'deviceID': req.body.deviceID,
                        'token': req.body.token
                    });
                }
                // Finally update the user
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
