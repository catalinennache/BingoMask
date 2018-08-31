
module.exports = class GameSession {


    constructor(sessionID, InternalService) {
        this.IS = InternalService;
        this.sessionID = sessionID;

        this.lifeCycle_Flags = [false, false, false];
        this.lifeCycle_index = 0;
        this.peers = [];

        this.ticket;
        this.balls = [];
        this.UserReceivedBall = [[],[]]
        
    
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
        return new Promise(resolve => setTimeout(resolve, 1000 * 10));
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
    }
    setCurrentBall(ball){
        this.currentball = ball;
        this.UserReceivedBall[this.currentball]=ball;

    }
    isCBDepleted(){
        this.UserReceivedBall
        this.peers;
        return this.UserReceivedBall[this.currentball].lenght == this.peers.length;
    }
    deplete(){
        let diff = this.peers.length - this.UserReceivedBall[this.currentball].lenght ;
        for(let j=0;j<diff;j++)
                this.UserReceivedBall.push("depleted");
    }
    arrangeBalls(ticket) {
      let balls = [];
        for(let i=0;i<3;i++)
            for(let j=0;j<9;j++)
                 balls.push(ticket[""+i+""+j+""]);
        return balls;
    }
    extractBallFor(token) {
        this.UserReceivedBall[this.currentball].constructor !== Array ? this.UserReceivedBall[this.currentball] =[]:{};
      let peerIndex =  this.peers.findIndex((obj)=>{
                if(obj.token == token)
                        return true;
        })

       if(this.UserReceivedBall[this.currentball].includes(token) && this.UserReceivedBall[this.currentball].lenght < this.peers.length)
                return {ready:false};
              else{ !this.UserReceivedBall[this.currentball] ? this.UserReceivedBall[this.currentball] =[]:{};
                  this.UserReceivedBall[this.currentball].push(token);
                return {number:this.balls[this.currentball]};
              }  
    }

    isP1Locked() {
        return this.lifeCycle_Flags[0];
    }
    getPhase(){
        return this.lifeCycle_index;
    }

    getChatURL(){
        return "N/A";
    }

}