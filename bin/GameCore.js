console.log("RUN IT BBY")

var GameSession_BluePrint = require('./GameSession');
var IService = require('./internal');
var CurrentGameSession = null;

setTimeout(
    async function () {
        while (true) {
            CurrentGameSession ? delete CurrentGameSession : {};
            let id = GenerateGameID();
            CurrentGameSession = new GameSession_BluePrint(id, IService);
            console.log("Game Session started with ID: " + id);
            console.log("Awaiting players.");
            await CurrentGameSession.P1();
            console.log("Game Session LOCKED!");
            console.log("Receiveing Ticket... ");
            var ticket_promise = await IService.GenerateTicket();
            console.log(ticket_promise);
            CurrentGameSession.P2(ticket_promise);
            console.log("Begining ball parsing");
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 3; j++) {
                    CurrentGameSession.setCurrentBall(""+j+""+i);
                    var awaitings = 0;
                    while (awaitings < 30 && !CurrentGameSession.isCBDepleted()) {
                        await someTime();
                        awaitings++;
                    }
                    if (!CurrentGameSession.isCBDepleted()) CurrentGameSession.deplete();
                }

            }
            console.log("Ball parsing finished");

            await CurrentGameSession.P3();
            console.log("Game session ended");
        }



    }, 1000 * 5)

function GenerateGameID() {

    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;

}

function someTime() {
    return new Promise(resolve => setTimeout(resolve, 100));
}
module.exports = {
    getGSession: function () {
        return CurrentGameSession;
    }
};