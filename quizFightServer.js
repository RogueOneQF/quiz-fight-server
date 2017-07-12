'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var routes = require('./routes/routes');
var admin = require("firebase-admin");

var serviceAccount = require("./quiz-fight-167108-firebase-adminsdk-db0n7-1b1e306fb9.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://quiz-fight-167108.firebaseio.com"
});

mongoose.connect('mongodb://admin:admin@ds137441.mlab.com:37441/quizfight')
    .then(() =>  console.log('connection succesful'))
    .catch((err) => console.error(err));

var app = express();
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: true }));

routes(app);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
