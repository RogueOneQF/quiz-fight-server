'use strict';

var duels = require('../controllers/duelController');
var quizzes = require('../controllers/quizController');
var questions = require('../controllers/questionController');
var errorHandler = require('../modules/errorHandler');

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
            var randoms = numbers.slice(0, 4);

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
    createRound(getFilterObject(req.body.topic), function(err, result) {
        console.log(result);
        duels.create({'element': {
            'user1ID': req.body.user1,
            'user2ID': req.body.user2,
            'quizzes': [result.quiz.id]
        }}, function(err, duel) {
            if (err) {
                errorHandler(res, err);
            } else {
                res.status(201).json({
                    'duel_id': duel.id,
                    'quiz_id': result.quiz.id,
                    'questions': result.questions
                });
            }
        });
    });
};

var put = function(req, res) {
    createRound(getFilterObject(req.body.topic), function(err, result) {
        duels.addRound(req.body.duelID, result.quiz.id, function(err, duel) {
            if (err) {
                errorHandler(res, err);
            } else {
                res.json({
                    'duel_id': req.body.duelID,
                    'quiz_id': result.quiz.id,
                    'questions': result.questions
                });
            }
        });
    });
};

module.exports = {
    post: post,
    put: put
};






/*function(req, res) {
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
}*/
