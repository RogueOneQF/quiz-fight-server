'use strict';

var mongoose = require('mongoose');
var Quiz = require('../models/quizModel');

var crud = require('./crud')('Quiz');

module.exports = crud;
