'use strict';

var duels = require('../controllers/duelController');
var errorHandler = require('../modules/errorHandler');

module.exports = function(req, res) {
    duels.getScoresByIDs(req.query.duelID, req.query.playerID, function(err, scores) {
        if (err) {
            errorHandler(res, err);
        } else {
            res.json({'scores': scores});
        }
    })
}
