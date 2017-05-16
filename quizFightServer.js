'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.connect('mongodb://admin:admin@ds137441.mlab.com:37441/quizfight')
    .then(() =>  console.log('connection succesful'))
    .catch((err) => console.error(err));

var app = express();
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: true }));

var duels = require('./controllers/duelController');
var quizzes = require('./controllers/quizController');
var questions = require('./controllers/questionController');
var errorHandler = function(res, err) {
    res.status(err.status).json(err);
};
app.route('/fight').post(function(req, res) {
    questions.list(function(err, qs) { // get the question set
        // TODO filter if a topic is provided
        if (err) {
            errorHandler(res, err);
        } else {
            // generate 5 random numbers
            var randoms = Array.apply(null, Array(5)).map(function() {
                return Math.round(Math.random() * qs.length);
            });
            quizzes.create({'element': {
                'questions':
                    randoms.map(function(r) {
                        return qs[r].id; // add selected questions to the quiz
                    })
            }}, function(err, quiz) {
                if (err) {
                    errorHandler(res, err);
                } else {
                    // create the duel given the first quiz (round)
                    duels.create({'element': {
                        'user1ID': req.body.user1,
                        'user2ID': req.body.user2,
                        'quizzes': [quiz.id]
                    }}, function(err, duel) {
                        if (err) {
                            errorHandler(res, err);
                        } else {
                            res.status(201).json({
                                'duel_id': duel.id,
                                'quiz_id': quiz.id,
                                'questions':
                                    randoms.map(function(r) {
                                        return qs[r];
                                    })
                            });
                        }
                    });
                }
            });
        }
    });
});

var checkWinner = function(duel, player) {
    var add = function(a, b) {return a + b;};
    var score1 = duel.user1Score.reduce(add, 0);
    var score2 = duel.user2Score.reduce(add, 0);
    var player1Winner, tie = false;
    if (duel.user1Score.length == 3 && duel.user2Score.length == 3) {
        if (score1 > score2) {
            player1Winner = true; // player 1 won
        } else if (score1 < score2) {
            player1Winner = false; // player 2 won
        } else {
            tie = true;
        }
    } else {
        player1Winner = null;
    }
    return {
        'tie': tie,
        'winner': (player1Winner === null) ? null :
            ((player == duel.user1_id) ? player1Winner : !player1Winner)
    };
}

app.route('/result').get(function(req, res) {
    duels.getByID(req.query.duelID, function(err, duel) {
        if (err) {
            errorHandler(res, err);
        } else {
            res.json(checkWinner(duel, req.body.playerID));
        }
    });
}).post(function(req, res) {
    duels.getByID(req.body.duel_id, function(err, duel) {
        var allowScore = function (duel, actualScore) {
            var duelIndex = duel.quizzes.indexOf(req.body.quiz_id);
            return (duelIndex != -1 && duel[actualScore].length < duelIndex + 1);
        };

        if (err) {
            errorHandler(res, err);
        } else {
            var scoreField = (req.body.userID == duel.user1ID) ? "user1Score" : "user2Score";
            if (allowScore(duel, scoreField)) {
                duel[scoreField].push(req.body.score);
                duels.update({
                    'elementID': duel.id,
                    'element': duel
                }, function(err, oldDuel) {
                    if (err) {
                        errorHandler(res, err);
                    } else {
                        quizzes.getByID(duel.quizzes[duel[scoreField].length - 1], function(err, quiz) {
                            if (err) {
                                errorHandler(res, err);
                            } else {
                                quiz["answers" + scoreField.charAt(4)].push(req.body.answers);
                                quizzes.update({
                                    'elementID': quiz.id,
                                    'element': quiz
                                }, function (err, quiz) {
                                    if (err) {
                                        errorHandler(res, err);
                                    } else {
                                        res.json(checkWinner(duel, req.body.userID));
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.status(500).json({
                    status: 500,
                    message: 'Score already sent'
                });
            }
        }
    });
});

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
