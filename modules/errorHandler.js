'use strict';

module.exports = function(res, err) {
    if (err) {
        res.status(err.status).json(err);
    }
};
