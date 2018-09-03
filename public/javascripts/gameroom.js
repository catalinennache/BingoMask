var _updatable;
var currentBall = 0;
var balls = [];
var indexes = [];
var rows = document.getElementById('ticket').getElementsByTagName('tr');
var timmer ;
function enterGame() {
    console.log("Attempting game enter");
    
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/entergame",
        data: {},
        success: function (data) {
            data = JSON.parse(data);
            console.log(data);
            setupTicket(data['ticket']);
            openSocket(data['gsess_token']);
        },
        error: function (err) {
            console.error(err);
        }
    })


}

function setupTicket(ticket) {
    log("Ticket received. Good Luck!");
    log("Please wait for ball extraction...")
    console.log("Arg local ticket");
    let frame = document.getElementById('userticket');
    let cells = frame.getElementsByTagName('td');
    let parsed_Cells = 0
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 9; j++) {
            ticket["" + i + "" + j] != 0 ? cells[parsed_Cells].innerHTML = ticket["" + i + "" + j] : cells[parsed_Cells].innerHTML = "&cross;";
            parsed_Cells++;
        }
    _updatable = true;

    timmer = setInterval(function () { update() }, 1000);
}

function update() {
    $.ajax({
        type: "post",
        url: "http://localhost:3000/update",
        success: function (data) {
           
            console.log(data);
            if (!data['error']) {
                let row = rows[data['index'][0]];
                let cell = row.getElementsByTagName('td')[data['index'][1]];
                console.log("ROW :" + data['index'][0]);
                console.log("Cell :" + data['index'][1]);
                if (cell.innerHTML == "") {
                    if (data['ball'] != 0) {
                        cell.innerHTML = data['ball'];
                        log("Ball " + data['ball'] + " extracted");
                    }
                    else
                        cell.innerHTML = "&cross;";
                    balls.push(data['ball'])
                    indexes.push(data['index']);
                    currentBall++;
                    
                }
            } else{
                if(data['reason']==2){
                    clearInterval(timmer);
                    log("Game Session ended.");
                    log("Thanks for playing.");
                }
            }
        },
        error: function (error) {
            console.log("Please wait");
        }
    })
}
function openSocket(bearer) {
    
        // if user is running mozilla then use it's built-in WebSocket
        window.WebSocket = window.WebSocket || window.MozWebSocket;

        var connection = new io('ws://localhost:2000?token='+bearer,{secure: true});
        document.getElementById('send').disabled=false;
        
        let listener = function(ev){
            connection.emit('new_message',{emittor:"Beleaua",message:document.getElementById('caption').value});
            document.getElementById('caption').value="";
             }
        connection.onopen = function () {
            log("Chat Connected");
            alert("chat online")
        };
        document.getElementById('send').addEventListener('click',listener);
        

        connection.onerror = function (error) {
            // an error occurred when sending/receiving data
        };
        connection.on('new_message',(data)=>{

            // try to decode json (I assume that each message
            // from server is json)
            console.log(data);
            
            let chatbox = document.getElementsByClassName('chat')[0];
            let message = document.createElement('strong');
            message.innerHTML = data.emittor +" : " + data.message;
            chatbox.appendChild(message);
            chatbox.appendChild(document.createElement('br'));
            document.getElementsByClassName('chat')[0].scrollTop = document.getElementsByClassName('chat')[0].scrollHeight;
       

        });
        
    return connection;
}



function log(text) {
    console.log("Logged text: ", text)
    let logs = document.getElementsByClassName('logs')[0];
    let log = document.createElement('li');
    log.innerHTML = text;
    logs.appendChild(log);
    document.getElementsByClassName('logs')[0].scrollTop = document.getElementsByClassName('logs')[0].scrollHeight;
       
}