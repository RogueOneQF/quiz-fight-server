'use strict';

var admin = require('firebase-admin');
var users = require('../controllers/userController');

function send(player, payload) {
    admin.messaging().sendToDevice(getTokensFromDevices(player.devices), {'data': payload})
        .then(function(response) {
            console.log("Successfully sent message:", response);
        })
        .catch(function(error) {
            console.log("Error sending message:", error);
        });
}

function getTokensFromDevices(devices) {
    return devices.map(function(device) {
        return device.token;
    });
}

module.exports = function(user, payload) {
    if (user.devices) {
        send(user, payload);
    }
    users.getByFilter({'googleUsername': user}, function(err, result) {
        if (!err && result) {
            send(result, payload);
        }
    });
};
