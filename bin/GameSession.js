var _ = require('lodash');
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

    addPeer(packtoken, user_session, pack_tickets) {
        if (!this.lifeCycle_Flags[this.lifeCycle_index]) {
            if (!this.peers.includes({ packtoken: packtoken, token: user_session, pack_tickets: pack_tickets })) {
                this.peers.push({ packtoken: packtoken, token: user_session, pack_tickets: pack_tickets });
                let info = this.getInfo();
                this.chat.to('stats').emit("update", info);
                this.chat.to("gameroom").emit("stats", info);
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
        let tmpdate = new Date();
        tmpdate.setMinutes(tmpdate.getMinutes() + 3);
        this.countdown = tmpdate;
        return new Promise(resolve => setTimeout(resolve, 1000 * 60 * 3));
    }

    P2(ticket) {

        this.ticket = ticket;
        //this.copycat = this.parseTicket(ticket);
        this.balls = this.arrangeBalls(ticket);
        console.log("arranged balls");
      

        this.lifeCycle_Flags[this.lifeCycle_index] = true;
        this.lifeCycle_index++;
    }

    P3() {

        this.lifeCycle_Flags[this.lifeCycle_index] = true;
        this.lifeCycle_index++;

        let SomeBodyWon = this.checkForWinner(this.ticket);

        if (SomeBodyWon) {

            this.chat.to('gameroom').emit("log", { msg: "Somebody won !" });
        } else {
            this.chat.to('gameroom').emit("log", { msg: "Thank you for playing!" });
        }

        this.chat.to('gameroom').emit("finish",{});


        return new Promise(resolve => setTimeout(resolve, 1000 * 60 * 1));
    }

    parseTicket(ticket){
        let keys = Object.keys(ticket);
        let copycat = {};
        for(let i in keys){
            if(keys[i] == "task_id" || keys[i] == "token")
                continue;
                else{
                    copycat[keys[i]] = ticket[keys[i]];
                }
        }

        return copycat;
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

    extractBall() {
        let rndcol = Math.floor(Math.random() * 10) % 9;
        let rndline = Math.floor(Math.random() * 10) % 3;
        
        while (this.balls["" + rndline + "" + rndcol] === false && this.isBDepleted != -1) {
            rndcol = Math.floor(Math.random() * 10) % 9;
            rndline = Math.floor(Math.random() * 10) % 3;
             
            

        }
        {   
            let value = this.balls["" + rndline + "" + rndcol];
            this.balls["" + rndline + "" + rndcol] = false
            let index = "" + rndline + "" + rndcol;
            console.log(this.balls["" + rndline + "" + rndcol])
            this.chat.emit("extraction", { extraction: true, value: value, index: index });
        } 
        this.isDepleted = -1;
        for(let j =0 ; j<this.balls.length;j++)
                {
                    if( !(this.balls[j] ===  false)  && this.balls[j]!==undefined ){
                             this.isDepleted++;
                    
                    }
            }
       

    }
    isBDepleted() {
        if (this.isBDepleted == -1) {
            return true;
        } else
            return false;
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
        return { index: this.lifeCycle_index, timmer: this.countdown };
    }

    getInfo() {
        let gameId = this.sessionID;
        let tickets = this.peers.length;
        let BingoWin = this.peers.length * 100 * 0.4;
        let BingoLine = this.peers.length * 100 * 0.05;
        return {
            gameId: gameId,
            tickets_sold: tickets,
            BingoWin: BingoWin,
            BingoLine: BingoLine
        }
    }

    getChatURL() {
        return "N/A";
    }

    startChatSession() {
        this.chat = require('socket.io')(2000);
        this.chat.of('/').on('connection', (socket) => {
            console.log("Incomming connection");
            let init_params = this.parseGetParams(socket.request.url);
            if (init_params['token'] && this.checkTokenValidity(init_params['token'])){
                console.log("Socket Connection Accepted !! " + init_params['token']);
                socket.join('gameroom');

              
                socket.emit("init", { tickets: this.getRegisteredTickets(init_params['token']) })
                socket.emit('new_message', { emittor: "Server", message: "Welcome Player " });


                socket.on('new_message', (data) => {
                    console.log(data);
                    this.chat.emit('new_message', { emittor: data.emittor, message: data.message });
                });
            } else if (init_params['stats']) {
                socket.join('stats');
                socket.emit("update", this.getInfo());
            } else {
                console.log("Blocked suspicious connection.", this.peers);
                socket.emit('new_message', { emittor: "Server", message: "Access Denied!" });
                // socket.disconnect();
            }
        });

       
    }
    destroyChatSession() {
        this.chat.close();
    }

    parseGetParams(url) {

        let urlQuery = url.split('?');
        urlQuery = urlQuery[urlQuery.length - 1];
        let params = {};
        let seq = urlQuery.split("&");
        for (let i in seq) {
            let pair = seq[i].split('=');
            params[pair[0]] = pair[1];
        }
     
        return params;
    }
    checkTokenValidity(packtoken) {
        

        let res = this.peers.find(function (object) {
           
            if (object.packtoken == packtoken)
                return true;
        });

        return res ? true : false;
    }

    getRegisteredTickets(pack_token) {
        let res = this.peers.find(function (object) {
            if (object.packtoken == pack_token)
                return true;
        });
        console.log("FOUND PEER: " + res);
        return res ? res.pack_tickets : false;
    }
    checkForWinner(ticket) {
        let official = JSON.parse(JSON.stringify(ticket));
        let res = this.peers.find(function (object) {
            let tickets = JSON.parse(object.pack_tickets)
            for (let i in tickets) {
                let ticket = tickets[i];
                official.id = ticket.id;
                if (_.isEqual(ticket, official)) return true;
            }

        });
        return res ? res : false;

        // tickets  need to be both parsed before comparision]
    }

}