'use strict';

var fight = require('./fight');
var result = require('./result');
var addToken = require('./addToken');

module.exports = function(app) {
	app.route('/fight')
        .post(fight.post)
        .put(fight.put);

	app.route('/result')
        .get(result.get)
        .put(result.put);

    app.route('/user')
        .put(addToken);
}
