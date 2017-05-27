'use strict';

var async = require('async');
var duels = require('../controllers/duelController');
var quizzes = require('../controllers/quizController');
var questions = require('../controllers/questionController');
var users = require('../controllers/userController');
var errorHandler = require('../modules/errorHandler');
var sendMessage = require('../modules/sendMessage');

var getFilterObject = function(filter) {
    return (filter) ? {'topic': filter} : {};
}

// efficient unique random number generator
var fisherYates = function (numbers, stopCount) {
    var i = numbers.length;
    if (i == 0) {
        return false;
    }
    var c = 0, tempi, tempj, j;
    while (--i && c != stopCount) {
        j = Math.floor(Math.random() * (i + 1));
        tempi = numbers[i];
        tempj = numbers[j];
        numbers[i] = tempj;
        numbers[j] = tempi;

        c++;
    }
}

var createRound = function(filter, callback) {
    questions.getByTopic(filter, function(err, qs) { // get the question set
        if (err) {
            callback(err);
        } else {
            // generate 5 random numbers
            var numbers = [];
            for (var i = 0; i < qs.length; i++) {
                numbers.push(i);
            }
            fisherYates(numbers, 5);
            var randoms = numbers.slice(0, 5);

            var mqs = randoms.map(function(r) {
                return qs[r];
            });

            quizzes.create({'element': {
                'questions':
                    randoms.map(function(r) {
                        return qs[r].id; // add selected questions to the quiz
                    })
            }}, function(err, quiz) {
                callback(err, {'quiz': quiz, 'questions': mqs})
            });
        }
    });
};

var post = function(req, res) {
    createRound(getFilterObject(req.body.topic1), function(err1, result1) {
		createRound(getFilterObject(req.body.topic2), function(err2, result2) {
			createRound(getFilterObject(req.body.topic3), function(err3, result3) {
                if (err1 || err2 || err3) {
                    errorHandler(err1 || err2 || err3);
                } else {
                    var actualOpponent;
                    async.series([
                        /**
                         * Get the opponent: if he/she is explicitly provided then
                         * retrieve him/her from body. Otherwise randomly exctract one.
                         */
                        function(callback) {
                            if (req.body.user2) {
                                actualOpponent = req.body.user2;
                                callback(null, null);
                            } else {
                                users.list(function(err, results) {
                                    if (err) {
                                        callback(err);
                                    } else if (!results) {
                                        callback(users.notFound);
                                    } else {
                                        var found = false;
                                        var randomUser;
                                        while (!found) {
                                            randomUser = Math.floor(Math.random() * results.length);
                                            found = (results[randomUser].googleUsername != req.body.user1);
                                        }
                                        actualOpponent = results[randomUser];
                                        callback(null, null);
                                    }
                                });
                            }
                        },

                        /**
                         * Actually create the duel.
                         */
                        function(callback) {
                            duels.create({'element': {
            				    'user1ID': req.body.user1,
            				    'user2ID': (actualOpponent.googleUsername) ? actualOpponent.googleUsername : actualOpponent,
            				    'quizzes': [result1.quiz.id, result2.quiz.id, result3.quiz.id]
            				}}, function(err, duel) {
            				    if (err) {
            				        callback(err);
            				    } else if (!duel) {
                                    callback(users.notFound);
                                } else {
                                    callback(null, {
            				            'duelID': duel.id,
            				            'quizID': result1.quiz.id,
                                        'topic': (result1.questions[0].topic),
            				            'questions': result1.questions.map(function(question) {
                                            return {
                                                'question': question.question,
                                                'trueOrFalse': question.trueOrFalse,
                                                'answer': question.answer,
                                                'difficulty': question.difficulty,
                                                'options': question.options
                                            }
                                        })
            				        });
            				    }
            				});
                        }
                    ],
                    function(err, result) {
                        if (err) {
                            errorHandler(res, err);
                        } else {
                            res.status(201).send(result[1]);
                            sendMessage(actualOpponent, {
                                'title': req.body.user1Username + " has dared you",
                                'message': "Go to show who you really are!",
                                'duelID': result[1].duelID
                            })
                        }
                    });
                }
			});
		});
    });
};

module.exports = {
    post: post
};
