'use strict';

var users = require('../controllers/userController');
var errorHandler = require('../modules/errorHandler');

var get = function(req, res) {

	/**
	 * Return the googleUsername of a user associated with a facebookId  
     * @param req.params.facebookId
     * @return A JSON with the googleUsername
     */
	users.getByFilter({'facebookId': req.params.facebookId}, function(err, user) {
		if (err) {
            errorHandler(res, err);
        } else {
			res.json({
				'googleUsername': user.googleUsername,
				'facebookId': user.facebookId
			});
		}
	});
}
	
var put = function(req, res) {

	users.getByFilter({'googleUsername': req.params.googleUsername}, function (err, user) {
		if (err) {
            errorHandler(res, err);
        } else {
			user.facebookId = req.params.facebookId;
			users.update({
				'elementID': user._id,
				'element': user
			});
			res.json({
				'googleUsername': user.googleUsername,
				'facebookId': user.facebookId
			});
		}
	});
}

module.exports = {
    get: get,
	put: put
};
