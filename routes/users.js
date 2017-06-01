'use strict';

var users = require('../controllers/userController');
var errorHandler = require('../modules/errorHandler');

/**
 * Return the googleUsername of a user associated with a facebookId
 * @param req.params.facebookId
 * @return A JSON with the googleUsername
 */
module.exports = function(req, res) {
    users.getByFilter({'facebookId': req.params.facebookId}, function(err, user) {
		if (err && (err.status == 400 || err.status == 404)) {
            errorHandler(res, err);
        } else {
			res.json({'googleUsername': user.googleUsername});
		}
	});
}
