'use strict';

var users = require('../controllers/userController');
var errorHandler = require('../modules/errorHandler');

var put = function(req, res) {
    users.getByUsername({'googleUsername': req.body.username}, function(err, user) {
        if (err && err.status == 400) {
            errorHandler(res, err);
        } else if (err && err.status == 404) { // new user
            users.create({
                'element': {
                    'googleUsername': req.body.username,
                    'tokens': [req.body.token]
                }
            }, function(err, user) {
                console.log(err, user)
                    res.status(201).send();
                });
        } else { // existing user
            if (user.tokens.indexOf(req.body.token) == -1) {
                user.tokens.push(req.body.token);
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
            } else {
                res.send();
            }
        }
    });
};

module.exports = put;
