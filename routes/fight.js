'use strict';

var async = require('async');
var duels = require('../controllers/duelController');
var quizzes = require('../controllers/quizController');
var questions = require('../controllers/questionController');
var users = require('../controllers/userController');
var errorHandler = require('../modules/errorHandler');
var sendMessage = require('../modules/sendMessage');

/**
 * Create a normalized filter object.
 * @param filter If not-null create a filter object, otherwise return an empty filter
 * @return A filter object to be used in mongoose.find
 */
var getFilterObject = function(filter) {
    return (filter) ? {'topic': filter} : {};
}

/**
 * Efficient unique random number generator
 * @param An array of numbers
 * @return The same array, shuffled
 */
function shuffle(array) {
    var m = array.length, t, i;
    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

/**
 * Create a new round with questions meeting the filter.
 * @param filter A filter object, see `getFilterObject`
 * @param callback The function to be called at the end of the creation
 */
var createRound = function(filter, callback) {
    questions.getByTopic(filter, function(err, qs) { // get the question set
        if (err) {
            callback(err);
        } else {
            // generate 5 random numbers using shuffling
            var numbers = [];
            for (var i = 0; i < qs.length; i++) {
                numbers.push(i);
            }

            var randoms = shuffle(numbers).slice(0, 5);

            var mqs = randoms.map(function(r) {
                return qs[r];
            });

            // Create the quiz with the selected questions
            quizzes.create({'element': {
                'questions':
                    randoms.map(function(r) {
                        return qs[r].id; // add selected questions to the quiz
                    })
            }}, function(err, quiz) {
                callback(err, {'quiz': quiz, 'questions': mqs}); // return to the caller
            });
        }
    });
};

/**
 * Create a new duel with three rounds. Questions topics must be provided as a parameter.
 * This function supports two types of duel creation:
 * -) random opponent, in this case no req.body.user2 is provided, and
 * -) dare a Google Games player, in this case req.body.user2 must contain the
 *    correct username used for looking up the user.
 * A notification is sent to the opponent. It carries the following information:
 {
     'id': Int, // notification ID
     'title': String,
     'message': String,
     'duelID': String,
     'opponent': String // Username of the player starting the duel
 }
 * @param req.body.topics Array containing the three topics
 * @param req.body.user2 Opponent. It can be undefined if "random duel" was chosen
 * @param req.body.user1 Current player, the one who's starting the duel
 * @return An JSON of the following type:
    {
     'duelID': String,
     'quizID': String,
     'topic': String, // topic of the first quiz
     'opponent': String,
     'questions': An array of JSON of the following type:
         {
             'question': String,
             'trueOrFalse': Boolean,
             'answer': Int,
             'difficulty': Int,
             'options': An array of JSON of the following type:
                 {
                     'option_id': Int,
                     'option': String
                 }
             })
         }
     }
 */
var post = function(req, res) {
    // Create three rounds
    createRound(getFilterObject(req.body.topics[0]), function(err1, result1) {
		createRound(getFilterObject(req.body.topics[1]), function(err2, result2) {
			createRound(getFilterObject(req.body.topics[2]), function(err3, result3) {
                if (err1 || err2 || err3) { // if an error occurred, stop everything
                    errorHandler(err1 || err2 || err3);
                } else {
                    var actualOpponent; // This will contain the opponet's username
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
                                        'opponent': duel.user2ID,
            				            'questions': result1.questions.map(function(question) {
                                            return {
                                                'question': question.question,
                                                'trueOrFalse': question.trueOrFalse,
                                                'answer': question.answer,
                                                'difficulty': question.difficulty,
                                                'options': question.options.map(function(option) {
                                                    return {
                                                        'option_id': option.option_id,
                                                        'option': option.option
                                                    }
                                                })
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
                            // Send the notification
                            sendMessage(actualOpponent, {
                                'id': "2",
                                'title': req.body.user1 + " has dared you",
                                'message': "Go to show who you really are!",
                                'duelID': result[1].duelID,
                                'opponent': req.body.user1
                            });
                        }
                    });
                }
			});
		});
    });
};

/**
 * Return the current round to the client.
 * @param req.params.duelID Duel ID
 * @param req.params.playerID User's username
 * @return An JSON of the following type:
    {
     'duelID': String,
     'quizID': String,
     'topic': String, // topic of the first quiz
     'opponent': String,
     'questions': An array of JSON of the following type:
         {
             'question': String,
             'trueOrFalse': Boolean,
             'answer': Int,
             'difficulty': Int,
             'options': An array of JSON of the following type:
                 {
                     'option_id': Int,
                     'option': String
                 }
             })
         }
     }
 */
var get = function(req, res) {
    duels.getByIDAndPopulate(req.params.duelID, function(err, duel) {
        if (err) {
            errorHandler(err);
        } else {
            // Retrieve the current round
            var round = (duel.user1ID == req.params.playerID) ? duel.user1Score.length : duel.user2Score.length;
            res.json({
                'duelID': duel.id,
                'quizID': duel.quizzes[round].id,
                'topic': duel.quizzes[round].questions[0].topic,
                'opponent': duel.user2ID,
                'questions': duel.quizzes[round].questions.map(function(question) {
                    return {
                        'question': question.question,
                        'trueOrFalse': question.trueOrFalse,
                        'answer': question.answer,
                        'difficulty': question.difficulty,
                        'options': question.options.map(function(option) {
                            return {
                                'option_id': option.option_id,
                                'option': option.option
                            }
                        })
                    }
                })
            });
        }
    });
}

module.exports = {
    post: post,
    get: get
};
