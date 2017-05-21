'use strict';

module.exports = function(player, winner, score, opponentsName) {
    var message, title;
    if (winner) {
        message = "You defeated " + opponentsName + " " + score.player + " - " + score.opponent;
        title = "You won :)";
    } else {
        message = opponentsName + " defeated you " + score.opponent + " - " + score.player;
        title = "You lost :(";
    }
    var payload = {
        'data': {
            'tie':              (winner === null),
            'winner':           winner,
            'playerScore':      score.player,
            'opponentScore':    score.opponent
        },
        'notification': {
            'title': title,
            'body': message
        }
    };

    admin.messaging().sendToDevice(player, payload)
        .then(function(response) {
            console.log("Successfully sent message:", response);
        })
        .catch(function(error) {
            console.log("Error sending message:", error);
        });
};
