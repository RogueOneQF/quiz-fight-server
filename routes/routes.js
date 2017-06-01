'use strict';

var fight = require('./fight');
var result = require('./result');
var addToken = require('./addToken');
var scores = require('./scores');
var users = require('./users');

module.exports = function(app) {
	app.route('/fight')
        .post(fight.post);

    app.route('/fight/:playerID/:duelID')
        .get(fight.get);

	app.route('/result')
        .put(result.put);

    app.route('/result/:playerID/:ids')
        .get(result.get);

    app.route('/user')
        .put(addToken);

    app.route('/scores/:playerID/:duelID')
        .get(scores);

	app.route('/users/:facebookId')
		.get(users.get);

	app.route('/users/:facebookId')
		.put(users.put);
}
