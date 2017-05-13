'use strict';

var mongoose = require('mongoose'),
  Question = mongoose.model('Duel');

var crud = require('./crud')('Duel');

module.exports = crud;
