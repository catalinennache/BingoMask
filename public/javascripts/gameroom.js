var _updatable;
var currentBall =0;
var balls =[];
function enterGame(){
    console.log("Attempting game enter");
    openSocket();
    $.ajax({
        type:"POST",
        url:"http://localhost:3000/entergame",
        data: {},
        success: function(data){
                data = JSON.parse(data);
                console.log(data);
                setupTicket(data['ticket']);
            
        },
        error: function(err){
            console.error(err);
        }
    })


}

function setupTicket(ticket){
     log("Ticket received. Good Luck!");
     console.log("Arg local ticket");
        let frame = document.getElementById('userticket');
      let cells=   frame.getElementsByTagName('td');
      let parsed_Cells=0
      for(let i=0;i<3;i++)
            for(let j=0;j<9;j++)
                { 
                     ticket[""+i+""+j] != 0 ? cells[parsed_Cells].innerHTML = ticket[""+i+""+j] : cells[parsed_Cells].innerHTML = "&cross;";
                     parsed_Cells++;
                }
                _updatable=true;

     setInterval(function(){update()},1000);           
}

function update(){
    $.ajax({
        type:"post",
        url:"http://localhost:3000/update",
        success:function(data){
            let frame = document.getElementById('ticket');
            console.log(data);
            if(!data['error'] && !balls.includes(data['ball'])){
               
            if(data['ball']!=0)
                frame.getElementsByTagName('td')[currentBall].innerHTML=data['ball'];
                else
                frame.getElementsByTagName('td')[currentBall].innerHTML="&cross;";
            balls.push(data['ball'])    
            currentBall++;
            log("Ball Extracted");
            }},
         error:function(error){
             console.log("Please wait");
         }   
    })
}
    function openSocket(){
        $(function () {
            // if user is running mozilla then use it's built-in WebSocket
            window.WebSocket = window.WebSocket || window.MozWebSocket;
          
            var connection = new WebSocket('ws://localhost:3000');
          
            connection.onopen = function () {
                log("Chat Connected")
            };
          
            connection.onerror = function (error) {
              // an error occurred when sending/receiving data
            };
          
            connection.onmessage = function (message) {
              // try to decode json (I assume that each message
              // from server is json)
              try {
                var json = JSON.parse(message.data);
              } catch (e) {
                console.log('This doesn\'t look like a valid JSON: ',
                    message.data);
                return;
              }
             let chatbox =   document.getElementsByClassName('chat')[0];
             let message = document.createElement('strong');
             message.innerHTML = json.msg;
             chatbox.appendChild(message);
             chatbox.appendChild(document.createElement('br'));
            };
          });
    }
   
 

    function log(text){
        console.log("Logged text: ",text)
       let logs= document.getElementsByClassName('logs')[0];
       let log = document.createElement('li');
       log.innerHTML = text;
       logs.appendChild(log);
    }