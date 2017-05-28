'use strict';

var duels = require('../controllers/duelController');
var errorHandler = require('../modules/errorHandler');

module.exports = function(req, res) {
    var ids = (req.query.duelID instanceof Array) ? req.query.duelID : [req.query.duelID];
    duels.getScoresByIDs(ids, req.query.playerID, function(err, scores) {
        if (err) {
            errorHandler(res, err);
        } else {
            res.json({'scores': scores});
        }
    })
}
