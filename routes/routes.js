'use strict';

var fight = require('./fight');
var result = require('./result');
var addToken = require('./addToken');

var admin = require("firebase-admin");

module.exports = function(app) {
	app.route('/fight')
        .post(fight.post);
        //.put(fight.put);

	app.route('/result')
        .get(result.get)
        .put(result.put);

    app.route('/user')
        .put(addToken);

    app.route('/tmpNotification').get(
        function(req, res) {
            admin.messaging().sendToDevice(
                "eyX5oxN1jwo:APA91bFjmhsm1QVBVii8XCmEV2TjfuOthAgAPRu0iXeiUa-G6dH9hyJqHvLT2qlWpRtQWHVbKdgTuZ_wTnskhQtG8IGL1tPj7hQH6FcEFs0P-VckbZMy0FPCqraZbvMxlm-9oTaxaMDh",
                {
                    'data': {
                        'key1': "PROVA",
                        'key2': "TEST",
                        'key3': true
                    }
                }
            )
                .then(function(response) {
                    console.log("Successfully sent message:", response);
                })
                .catch(function(error) {
                    console.log("Error sending message:", error);
                });
        }
    )
}
