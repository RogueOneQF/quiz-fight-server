'use strict';

var router = require('express').Router();
var bodyParser = require('body-parser');

router.get('/', function(req, res) {
    res.json({test: 1});
});

router.options('/', function(req, res, next){
    console.log(req.headers.origin);
    res.send();
});

module.exports = router;
