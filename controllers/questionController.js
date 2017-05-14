'use strict';

var mongoose = require('mongoose');
var Question = require('../models/questionModel');

var crud = require('./crud')('Question');

module.exports = crud;
