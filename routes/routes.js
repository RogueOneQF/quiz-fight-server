'use strict';

var fight = require('./fight');
var result = require('./result');

module.exports = function(app) {
	app.route('/fight')
        .post(fight.post);
        //.put(fight.put);

	app.route('/result')
        .get(result.get)
        .put(result.put);
}
