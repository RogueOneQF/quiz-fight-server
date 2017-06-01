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
			res.json({'googleUsername': user.googleUsername});
		}
	});
}
	
var put = function(req, res) {

	users.update({'facebookId': req.params.facebookId}, function(err, user) {
		if (err) {
            errorHandler(res, err);
        } else {
			res.json({
				googleUsername: user.googleUsername,
				facebookId: user.facebookId,
            	devices: user.devices
			});
		}
	});
}

module.exports = {
    get: get,
	put: put
};
