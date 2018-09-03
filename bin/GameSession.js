
module.exports = class GameSession {


    constructor(sessionID, InternalService) {
        this.IS = InternalService;
        this.sessionID = sessionID;

        this.lifeCycle_Flags = [false, false, false];
        this.lifeCycle_index = 0;
        this.peers = [];

        this.ticket;
        this.balls = [];
        this.UserReceivedBall = [[], []]


    }

    addPeer(user_session, ticket) {
        if (!this.lifeCycle_Flags[this.lifeCycle_index]) {
            if (!this.peers.includes({ token: user_session, ticket: ticket })) {
                this.peers.push({ token: user_session, ticket: ticket });

                return true;
            }
            else
                return true;
        } else {
            return false;
        }
    }

    P1() {
        this.startChatSession();
        return new Promise(resolve => setTimeout(resolve, 1000 * 30));
    }

    P2(ticket) {

        this.ticket = ticket;
        this.balls = this.arrangeBalls(ticket);

        this.lifeCycle_Flags[this.lifeCycle_index] = true;
        this.lifeCycle_index++;
    }

    P3() {

        this.lifeCycle_Flags[this.lifeCycle_index] = true;
        this.lifeCycle_index++;
        this.destroyChatSession();
        return new Promise(resolve => setTimeout(resolve, 1000 * 60 * 1));
    }
    setCurrentBall(ball) {
        this.currentball = ball;
        this.UserReceivedBall[this.currentball] = ball;

    }
    isCBDepleted() {
        this.UserReceivedBall
        this.peers;
        return this.UserReceivedBall[this.currentball].lenght == this.peers.length;
    }
    deplete() {
        let diff = this.peers.length - this.UserReceivedBall[this.currentball].lenght;
        for (let j = 0; j < diff; j++)
            this.UserReceivedBall.push("depleted");
    }
    arrangeBalls(ticket) {
        let balls = [];
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 9; j++) {
            balls["" + i + "" + j] = (ticket["" + i + "" + j]);
                console.log("Added ball " + ("" + i + "" + j) + " with value " + ticket["" + i + "" + j])
            }
        return balls;
    }
    extractBallFor(token) {
        this.UserReceivedBall[this.currentball].constructor !== Array ? this.UserReceivedBall[this.currentball] = [] : {};
        let peerIndex = this.peers.findIndex((obj) => {
            if (obj.token == token)
                return true;
        })

        if (this.UserReceivedBall[this.currentball].includes(token) && this.UserReceivedBall[this.currentball].lenght < this.peers.length)
            return { ready: false };
        else {
            !this.UserReceivedBall[this.currentball] ? this.UserReceivedBall[this.currentball] = [] : {};
            this.UserReceivedBall[this.currentball].push(token);
            return { number: this.balls[this.currentball], index: this.currentball };
        }
    }

    isP1Locked() {
        return this.lifeCycle_Flags[0];
    }
    getPhase() {
        return this.lifeCycle_index;
    }

    getChatURL() {
        return "N/A";
    }

    startChatSession() {
        this.chat = require('socket.io').listen(2000);
        this.chat.on('connection', (socket) => {
            let init_params = this.parseGetParams(socket.request.url);
           if(init_params['token'] && this.checkTokenValidity(init_params['token'])){
            console.log("Socket Connection Accepted !! ")
            // chat.sockets.send({message:"Welcome playa\'"})
            socket.emit('new_message', { emittor: "Server", message: "Welcome Player " });
            //chat.emit('new_message',{message:"Welcome Pleya\' "});

            socket.on('new_message', (data) => {
                console.log(data);
                this.chat.emit('new_message', { emittor: data.emittor, message: data.message });
            })
        }else{ console.log("Blocked suspicious connection.",this.peers);
            socket.emit('new_message', { emittor: "Server", message: "Access Denied!" });
            socket.disconnect();
        }});
    }
    destroyChatSession(){
        this.chat.close();
    }
    
    parseGetParams(url){
         
        let urlQuery = url.split('?');
        urlQuery = urlQuery[urlQuery.length-1];
        let params ={};
        let seq = urlQuery.split("&");
        for( let i in seq){
            let pair = seq[i].split('=');
            params[pair[0]]=pair[1];
        }
        console.log(params);
        return params;
    } 
    checkTokenValidity(token){
        // checks for ticket token, not the user_token
        // ticket token limits the validity period down to a single game session
        
       let res = this.peers.find(function(object){
                if(object.ticket.token == token)
                    return true;
        });

        return res ? true : false;
    }

}