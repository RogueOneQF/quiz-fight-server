'use strict';

var duels = require('../controllers/duelController');
var quizzes = require('../controllers/quizController');
var questions = require('../controllers/questionController');
var errorHandler = require('../modules/errorHandler');

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
};

var get = function(req, res) {
    duels.getByID(req.query.duelID, function(err, duel) {
        if (err) {
            errorHandler(res, err);
        } else {
            res.json(checkWinner(duel, req.body.playerID));
        }
    });
};

var put = function(req, res) {
    duels.getByID(req.body.duelID, function(err, duel) {
        var allowScore = function (duel, actualScore) {
            var duelIndex = duel.quizzes.indexOf(req.body.quizID);
            return (duelIndex != -1 && duel[actualScore].length < duelIndex + 1);
        };

        if (err) {
            errorHandler(res, err);
        } else {
            var scoreField = (req.body.playerID == duel.user1ID) ? "user1Score" : "user2Score";
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
                                        res.json(checkWinner(duel, req.body.playerID));
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
}

module.exports = {
    get: get,
    put: put
};
