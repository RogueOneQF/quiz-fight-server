'use strict';

module.exports = function(res, err) {
    res.status(err.status).json(err);
};
