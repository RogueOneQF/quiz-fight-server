'use strict';

var mongoose = require('mongoose');
var Duel = require('../models/duelModel');

var crud = require('./crud')('Duel');

module.exports = crud;
