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
				duels.create({'element': {
				    'user1ID': req.body.user1,
				    'user2ID': req.body.user2,
				    'quizzes': [result1.quiz.id, result2.quiz.id, result3.quiz.id]
				}}, function(err, duel) {
				    if (err) {
				        errorHandler(res, err);
				    } else {
				        res.status(201).json({
				            'duelID': duel.id,
				            'quizID': [result1.quiz.id, result2.quiz.id, result3.quiz.id],
				            'questions': [result1.questions, result2.questions, result3.questions]
				        });
				    }
				});
			});
		});
    });
};

/* var put = function(req, res) {
    createRound(getFilterObject(req.body.topic), function(err, result) {
        duels.addRound(req.body.duelID, result.quiz.id, function(err, duel) {
            if (err) {
                errorHandler(res, err);
            } else {
                res.json({
                    'duelID': req.body.duelID,
                    'quizID': result.quiz.id,
                    'questions': result.questions
                });
            }
        });
    });
}; */

module.exports = {
    post: post
    // put: put
};
