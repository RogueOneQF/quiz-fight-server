'use strict';

var mongoose = require('mongoose'),
  Question = mongoose.model('Quiz');

var crud = require('./crud')('Quiz');

module.exports = crud;
