'use strict';

var duels = require('../controllers/duelController');
var quizzes = require('../controllers/quizController');
var errorHandler = require('../modules/errorHandler');
var sendMessage = require('../modules/sendMessage');

// Simply add two elements
var add = function(a, b) {return a + b;};

/**
 * Check the winner based on scores.
 * @param duel A duel object
 * @param player Current player
 * @return A JSON of the following type:
 {
     'tie': Boolean,
     'winner': Boolean // true if player won, false otherwise
 }
 */
var checkWinner = function(duel, player) {
    // Sum the scores
    var score1 = duel.user1Score.reduce(add, 0);
    var score2 = duel.user2Score.reduce(add, 0);
    var player1Winner, tie = false;
    // Do some controls for selelctiong the winner, if exists
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

/**

 */
var get = function(req, res) {
    var ids = (req.params.ids !== undefined) ? req.params.ids.split(',') : [];
    duels.getChangesAndNewDuels(ids, req.params.playerID, function(err, filteredDuels) {
        if (err) {
            errorHandler(res, err);
        } else {
            res.send(filteredDuels);
        }
    });
};

/**
 * Add a new score for a round. If both the players have completed the round
 * a notification is sent to both of them. This will notify them for a new
 * available round. If the duel is completed, a notification is sent fot notify
 * both of them for the winner. Otherwise (no round completion), no notification
 * is sent.
 * @param req.body.duelID Duel ID
 * @param req.body.quizID Quiz ID
 * @param req.body.playerID Player's username
 * @param req.body.score Round score
 * @param req.body.answers Given answers (boolean array)
 * @return Nothing
 * @error 500 If the score has already been sent
 */
var put = function(req, res) {
    duels.getByID(req.body.duelID, function(err, duel) {
        // CHeck whether the score insertion is allowed or not
        var allowScore = function (duel, actualScore) {
            var duelIndex = duel.quizzes.indexOf(req.body.quizID);
            return (duelIndex != -1 && duel[actualScore].length < duelIndex + 1);
        };

        if (err) {
            errorHandler(res, err);
        } else {
            // Select the correct score field based on the current user
            var scoreField = (req.body.playerID == duel.user1ID) ? "user1Score" : "user2Score";
            if (allowScore(duel, scoreField)) {
                duel[scoreField].push(req.body.score); // Add the score and update the duel
                duels.update({
                    'elementID': duel.id,
                    'element': duel
                }, function(err, oldDuel) {
                    if (err) {
                        errorHandler(res, err);
                    } else {
                        // Get the current quiz (the one to be completed)
                        quizzes.getByID(duel.quizzes[duel[scoreField].length - 1], function(err, quiz) {
                            if (err) {
                                errorHandler(res, err);
                            } else {
                                // Add the given answers to the correct `answers` field and update
                                quiz["answers" + scoreField.charAt(4)] = req.body.answers;
                                quizzes.update({
                                    'elementID': quiz.id,
                                    'element': quiz
                                }, function (err, oldQuiz) {
                                    if (err) {
                                        errorHandler(res, err);
                                    } else {
                                        var outcome = checkWinner(duel, req.body.playerID); // check for victory
                                        res.send();
                                        // If a new round is available (duel not completed)
                                        if (duel.user1Score.length == duel.user2Score.length) {
                                            var notification = {};
                                            // Notify for a new round
                                            if (duel.user1Score.length < 3) {
                                                notification = {
                                                    'id': "3",
                                                    'title': "Round completed!",
                                                    'message': "You can now go on answering.",
                                                    'duelID': duel.id
                                                };
                                            } else { // Duel completed
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
                                                // Notify for victory
                                                notification = {
                                                    'id': "4",
                                                    "title": title,
                                                    "message": message,
                                                    "duelID": duel.id,
                                                    "outcome": (outcome.winner + "")
                                                }
                                            }

                                            // Also send back the answers of the other player.
                                            // In this way a client is able to correctly populate its history
                                            // without further server requests.
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
