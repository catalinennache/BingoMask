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
            while(CurrentGameSession.isDepleted != -1){
                    
                    await someTime();
                    CurrentGameSession.extractBall();

                }

            
            console.log("Ball parsing finished");

            await CurrentGameSession.P3();
            CurrentGameSession.destroyChatSession();
            console.log("Game session ended");
        }



    }, 1000 * 5)

function GenerateGameID() {

    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 19; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;

}

function someTime() {
    let someTime = Math.floor(Math.random()*7000); // asteapta intre 0 si 7 secunde
    return new Promise(resolve => setTimeout(resolve, someTime));
}
module.exports = {
    getGSession: function () {
        return CurrentGameSession;
    }
};