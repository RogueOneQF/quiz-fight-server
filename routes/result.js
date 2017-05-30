'use strict';

var duels = require('../controllers/duelController');
var quizzes = require('../controllers/quizController');
var errorHandler = require('../modules/errorHandler');
var sendMessage = require('../modules/sendMessage');

var add = function(a, b) {return a + b;};

var checkWinner = function(duel, player) {
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
        'winner': player1Winner
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
                                quiz["answers" + scoreField.charAt(4)] = req.body.answers;
                                quizzes.update({
                                    'elementID': quiz.id,
                                    'element': quiz
                                }, function (err, oldQuiz) {
                                    if (err) {
                                        errorHandler(res, err);
                                    } else {
                                        var outcome = checkWinner(duel, req.body.playerID);
                                        res.send();
                                        if (duel.user1Score.length == duel.user2Score.length) {
                                        // Duel not completed
                                            var notification = {};
                                            if (duel.user1Score.length < 3) {
                                                notification = {
                                                    'id': "3",
                                                    'title': "Round completed!",
                                                    'message': "You can now go on answering.",
                                                    'duelID': duel.id
                                                };
                                            } else {
                                            // Duel completed
                                                var score1 = duel.user1Score.reduce(add, 0);
                                                var score2 = duel.user2Score.reduce(add, 0);
                                                var title = (outcome.winner) ?
                                                    "You won :)" : ((outcome.tie) ? "Tie!" : "You lost :(");
                                                var message = "";
                                                if (req.body.playerID == duel.user1ID) {
                                                    message = score1 + " - " + score2;
                                                } else {
                                                    message = score2 + " - " + score1;
                                                }
                                                notification = {
                                                    'id': "4",
                                                    "title": title,
                                                    "message": message,
                                                    "duelID": duel.id,
                                                    "outcome": (outcome.winner + "")
                                                }
                                            }


                                            var answersStringPlayer = "";
                                            var answersStringOpponent = "";
                                            var notification1 = notification;
                                            var notification2 = notification;

                                            if (req.body.playerID == duel.user1ID) {
                                                answersStringPlayer = quiz.answers2.join();
                                                answersStringOpponent = req.body.answers.join();
                                            } else {
                                                answersStringPlayer = quiz.answers1.join();
                                                answersStringOpponent = req.body.answers.join();
                                            }

                                            notification1.answers = answersStringPlayer;
                                            notification2.answers = answersStringOpponent;

                                            sendMessage(duel.user1ID, notification1);
                                            sendMessage(duel.user2ID, notification2);
                                        }
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
