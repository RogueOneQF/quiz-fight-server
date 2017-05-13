'use strict';

var mongoose = require('mongoose'),
  Question = mongoose.model('Question');

var crud = require('./crud')('Question');

module.exports = crud;
