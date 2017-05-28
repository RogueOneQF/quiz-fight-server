'use strict';

var fight = require('./fight');
var result = require('./result');
var addToken = require('./addToken');
var scores = require('./scores');

module.exports = function(app) {
	app.route('/fight')
        .post(fight.post);

	app.route('/result')
        .get(result.get)
        .put(result.put);

    app.route('/user')
        .put(addToken);

    app.route('/scores/:playerID/:duelID')
        .get(scores);
}
