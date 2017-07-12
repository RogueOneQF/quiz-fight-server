'use strict';

var duels = require('../controllers/duelController');
var errorHandler = require('../modules/errorHandler');

module.exports = function(req, res) {
    var ids = req.params.duelID.split(',');//(req.param.duelID instanceof Array) ? req.param.duelID : [req.param.duelID];
    duels.getScoresByIDs(ids, req.params.playerID, function(err, scores) {
        if (err) {
            errorHandler(res, err);
        } else {
            res.json({'scores': scores});
        }
    });
}
