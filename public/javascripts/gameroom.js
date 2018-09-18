var _updatable;
var currentBall = 0;
var balls = [];
var indexes = [];
//var rows = document.getElementById('ticket').getElementsByTagName('tr');
var timmer;
panelSwitch(document.getElementsByClassName('content')[0].getElementsByTagName('span')[0]);



$('.content header span:first-child(), .content header span:last-child()').on('click', function (ev) {
    panelSwitch(ev.currentTarget);
})



function enterGame() {
    console.log("Attempting game enter");

    /*$.ajax({
        type: "POST",
        url: "http://86.123.134.100:3000/entergame",
        data: {},
        success: function (data)*/
    {
        data = JSON.parse(data);
        console.log(data);
      //  openSocket(window.bearer);
    }

}

function setupTicket(ticket) {

    log("Please wait for ball extraction...");

    let frame = document.getElementById('userticket');
    let cells = frame.getElementsByTagName('td');

    let parsed_Cells = 0;

    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 9; j++) {
            ticket["" + i + "" + j] != 0 ? cells[parsed_Cells].innerHTML = ticket["" + i + "" + j] : cells[parsed_Cells].innerHTML = "&cross;";
            parsed_Cells++;
        }
    _updatable = true;


}

function update() {
    $.ajax({
        type: "post",
        url: "http://86.123.134.100:3000/update",
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
            } else {
                if (data['reason'] == 2) {
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

    var connection = new io('ws://86.123.134.100:2000?token=' + bearer);
    document.getElementById('send').disabled = false;

    let listener = function (ev) {
        connection.emit('new_message', { emittor: "Beleaua", message: document.getElementById('caption').value });
        document.getElementById('caption').value = "";
    }
    connection.onopen = function () {
        log("Chat Connected");
        alert("chat online")
    };
    document.getElementById('send').addEventListener('click', listener);


    connection.onerror = function (error) {
        // an error occurred when sending/receiving data
    };
    connection.on('new_message', (data) => {

        // try to decode json (I assume that each message
        // from server is json)
        console.log(data);
        {


            let chatbox = document.getElementsByClassName('chat')[0];
            let message = document.createElement('strong');
            message.innerHTML = data.emittor + " : " + data.message;
            chatbox.appendChild(message);
            chatbox.appendChild(document.createElement('br'));
            document.getElementsByClassName('chat')[0].scrollTop = document.getElementsByClassName('chat')[0].scrollHeight;
        }  

    });
    connection.on("extraction",function(data){
        window.ticket.revealBall(data['index'],data['value']);
        document.getElementById('monitor').innerHTML = data['value']== 0 ? "&cross;":data['value'];

        if(data['value'] != 0)
             log("Ball "+data['value']+" extracted");
    });

    connection.on("stats",function(data){
        let grp = document.getElementById('sts');
        let sts = grp.getElementsByTagName('li');
        sts[0].innerHTML = "Tickets Sold: " + data['tickets_sold'];
        sts[1].innerHTML = "BingoWin: " + data['BingoWin'] + " &mu;Ƀ";
        sts[2].innerHTML = "BingoLine: " + data['BingoLine'] + " &mu;Ƀ";
    })

    connection.on("init",function(data){
            console.log("initialized")
            console.log(data);
            window.ticket = new Ticket();
            window.ticket.append(document.getElementsByClassName('panel')[0]);

            window.tck = [];
            let tickets = JSON.parse(data['tickets']);
            console.log(tickets);
            let panel = document.getElementById('mytickets');
            let liwrapper ;
            for (let i = 0; i < tickets.length; i++) {
               liwrapper = document.createElement('li');
                try {
                    let ticket = JSON.parse(tickets[i]);
                    console.log(ticket);
                    window.tck.push(new Ticket(ticket,true));
                    window.tck[i].append(liwrapper);
                    panel.appendChild(liwrapper);
                } catch (e) { console.log(e); }
            }
        
    });
    connection.on("finish",function(data){
        connection.close();
         
    })
    connection.on("log",function(data){
        log(data['msg']);
    })
    console.log("Socket opened");
    return connection;
}


function panelSwitch(source_element) {
    console.log(source_element);
    let views = document.getElementsByClassName('content')[0].getElementsByTagName('ul');
    switch (source_element.innerHTML) {
        case " Tickets": {
            document.getElementsByClassName('active')[0] ? document.getElementsByClassName('active')[0].classList.remove("active") : {};
            source_element.classList.add("active");
            !views[1].classList.contains("hidden") ? {} : views[1].classList.remove("hidden");
            views[0].classList.add('hidden');
        } break;
        case "Game Log": {
            document.getElementsByClassName('active')[0] ? document.getElementsByClassName('active')[0].classList.remove("active") : {};
            source_element.classList.add("active");
            !views[0].classList.contains("hidden") ? {} : views[0].classList.remove("hidden");
            views[1].classList.add('hidden');
        } break;
    }



}


function log(text) {
    console.log("Logged text: ", text)
    let logs = document.getElementsByClassName('logs')[0];
    let log = document.createElement('li');
    log.innerHTML = text;
    logs.appendChild(log);
    document.getElementsByClassName('logs')[0].scrollTop = document.getElementsByClassName('logs')[0].scrollHeight;

}




class Ticket {

    constructor(data_array,v2) {
        this.v2=v2;
        this.frame = document.createElement('table');
        this.frame.id="frame";
        this.logicalmatrix = [];
        this.physicalmatrix = [];
        let line = [];
        let physicalLine = [];
        for (let i = 0; i < 3; i++) {
            var tablerow = document.createElement('tr');
            for (let j = 0; j < 9; j++) {
                line.push(data_array ? data_array["" + i + "" + j] : 0);
                physicalLine.push(document.createElement('td'));
                if(!v2)
                physicalLine[j].innerHTML = data_array ? data_array["" + i + "" + j] == 0 ? "&cross;" : data_array["" + i + "" + j] : "-";
                    else
                    physicalLine[j].innerHTML = data_array ? data_array[i][j] == 0 ? "&cross;" : data_array[i][j] : "-";   
                tablerow.appendChild(physicalLine[j]);
            }
            this.logicalmatrix.push(line);
            this.physicalmatrix.push(physicalLine);
            this.frame.appendChild(tablerow);
            line = [];
            physicalLine = [];

        }
        this.id = "<div class=\"id\"><h4>Id: " + (data_array ? data_array['token'] : 0) + "</h4></div>";
  
        
        this.serie = (data_array ? data_array['token'] : 0);


    }

    append(element) {

        let card = document.createElement('div');
        card.classList.add('card');
        card.classList.add('tck');
        card.appendChild(this.frame);
        card.innerHTML += this.id;
        element.appendChild(card);


    }

    revealBall(index,value){
        console.log(index,value);
       let line = index.slice(0,1);
       let col = index.slice(1,2);
       console.log(line,col);
       console.log((line+1)*col,document.getElementById('frame').getElementsByTagName('td')[(line+1)*col] )
      let frame = [];
      var arr = [].slice.call(document.getElementById('frame').getElementsByTagName('td'));
      frame.push(arr.slice(0,9));
      frame.push(arr.slice(9,18));
      frame.push(arr.slice(18,27));
      
      frame[line][col].innerHTML = value == 0? "&cross;" : value;
    }





}