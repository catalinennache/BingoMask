document.getElementById('go').addEventListener('click',function(e){
  enterGame();
})

function enterGame() {
  document.getElementById('go').disabled = true;
  document.getElementById('regen').disabled = true;
  let data = assembleData();
  $.ajax({
    type: "post",
    url: "http://86.123.134.100:3000/preflight/go",
    data: {params: data},
    success: function (data) {
      if (data['goodtogo']) {
        window.location.href = "http://86.123.134.100:3000/gameroom";
      } else {
        window.toaster.toast("Something went wrong, please try again.");
        document.getElementById('go').disabled = false;
        document.getElementById('regen').disabled = false;
      }
    }
  })
}

function assembleData() {

  let params = {};
  params['pack_token'] = window.pack_token; // needs to be stored
  params['gameId'] = window.gameId; //needs to be stored;

  for (let i in window.tck) {
    params[i] = {
      id: window.tck[i].serie,
      ticket: JSON.stringify(window.tck[i].logicalmatrix)
    }
  }

  return JSON.stringify(params);


}


function clearPanel() {
  let panel = document.getElementsByClassName('panel')[0];
  if (panel.classList.length > 1)
    panel.classList.remove(panel.classList.contains("toolate") ? "toolate"
      : panel.classList.contains("errorregen") ? "errorregen"
        : "splash");
  console.log("REMOVED : " + panel.classList.contains("toolate") ? "toolate"
    : panel.classList.contains("errorregen") ? "errorregen"
      : "splash")
  panel.innerHTML = "";
  return document.getElementsByClassName('panel')[0];
}

$(window).on('load', initContext());

function initContext() {
  $.ajax({
    type: "post",
    url: "http://86.123.134.100:3000/preflight/init",
    data: {},
    success: function (data) {
      window.pack_token = data['tickets']['pack_token'];
      window.tck = [];
      let deadline = new Date(data['deadline']);
      
      
      let tickets = data['tickets'];
      let panel = document.getElementsByClassName('panel')[0];

      for (let i = 0; i < Object.keys(tickets).length; i++) {
        try {
          let ticket = JSON.parse(tickets[i]);
          window.tck.push(new Ticket(ticket));
          window.tck[i].append(panel);
        } catch (e) { }
      }
      initCountDown(deadline);
      if(Date.now()- deadline > 0 ){
          configTooLate();
      }
      var updates = io("ws://86.123.134.100:2000/?stats=true");
      updates.on("connected", function (data) {
        console.log("Socket Connected !");

      })
      updates.on("update", function (data) {
        console.log(data);
        let grp = document.getElementsByClassName('group')[0];
        let sts = grp.getElementsByTagName('h3');
        sts[0].innerHTML = "Tickets Sold: " + data['tickets_sold'];
        sts[1].innerHTML = "BingoWin: " + data['BingoWin'] + " &mu;Ƀ";
        sts[2].innerHTML = "BingoLine: " + data['BingoLine'] + " &mu;Ƀ";
      })

      window.setTimeout(function () {
        document.body.classList.remove('is-preload');
      }, 100);

    },
    error: function (data) {
      window.toaster.toast("Please wait while we generate you the luckiest tickets !");
      window.reloads = window.reloads ? ++window.reloads : 1;
      if (window.reloads <= 3)
        initContext();
      else
        window.location.reload();
    }
  });
}

$('#regen').on('click', function (ev) {
  regenerateTickets();
})
function regenerateTickets() {
  $('.card ').fadeOut(100);

  clearPanel().classList.add("splash");




  $.ajax({
    type: "post",
    url: "http://86.123.134.100:3000/preflight/regenerate",
    data: {},
    success: function (data) {
      window.pack_token = data['tickets']['pack_token'];
      window.tck = [];
      let tickets = data['tickets'];

      clearPanel();
      let panel = document.getElementsByClassName('panel')[0];
      panel.innerHTML = ""
      for (let i = 0; i < Object.keys(tickets).length - 1; i++) {

        try {
          let ticket = JSON.parse(tickets[i]);
          window.tck.push(new Ticket(ticket));
          window.tck[i].append(panel);
        } catch (e) { }

      }

    }, error: function (err) {
      if (!window.toolate) clearPanel().classList.add("errorregen");
      else {
        clearPanel().classList.add("toolate");
      }
    }
  })
}



function initCountDown(date) {
  var labels = ['weeks', 'days', 'hours', 'minutes', 'seconds'],
    nextYear = date,
    template = _.template(`
      <div class="time <%= label %>">
        <span class="count curr top"><%= curr %></span>
        <span class="count next top"><%= next %></span>
        <span class="count next bottom"><%= next %></span>
        <span class="count curr bottom"><%= curr %></span>
        <span class="label"><%= label.length < 6 ? label : label.substr(0, 3)  %></span>
      </div>
      `),
    currDate = '00:00:00:00:00',
    nextDate = '00:00:00:00:00',
    parser = /([0-9]{2})/gi,
    $example = $('#countdown');
  // Parse countdown string to an object
  function strfobj(str) {
    var parsed = str.match(parser),
      obj = {};
    labels.forEach(function (label, i) {
      obj[label] = parsed[i]
    });
    return obj;
  }
  // Return the time components that diffs
  function diff(obj1, obj2) {
    var diff = [];
    labels.forEach(function (key) {
      if (obj1[key] !== obj2[key]) {
        diff.push(key);
      }
    });
    return diff;
  }
  // Build the layout
  var initData = strfobj(currDate);
  labels.forEach(function (label, i) {
    $example.append(template({
      curr: initData[label],
      next: initData[label],
      label: label
    }));
  });
  // Starts the countdown
  $example.countdown(nextYear, function (event) {
    var newDate = event.strftime('%w:%d:%H:%M:%S'),
      data;
    if (newDate !== nextDate) {
      currDate = nextDate;
      nextDate = newDate;
      // Setup the data
      data = {
        'curr': strfobj(currDate),
        'next': strfobj(nextDate)
      };
      // Apply the new values to each node that changed
      diff(data.curr, data.next).forEach(function (label) {
        var selector = '.%s'.replace(/%s/, label),
          $node = $example.find(selector);
        // Update the node
        $node.removeClass('flip');
        $node.find('.curr').text(data.curr[label]);
        $node.find('.next').text(data.next[label]);
        // Wait for a repaint to then flip
        _.delay(function ($node) {
          $node.addClass('flip');
        }, 50, $node);
      });
    }
  });
  $example.on('finish.countdown', function () { configTooLate() });
}

function configTooLate() {
  window.toolate = true;
  clearPanel().classList.add("toolate");
  $("#go").val("Spectate");
  //
  // shit
}





class Ticket {

  constructor(data_array) {

    this.frame = document.createElement('table');
    this.logicalmatrix = [];
    this.physicalmatrix = [];
    let line = [];
    let physicalLine = [];
    for (let i = 0; i < 3; i++) {
      var tablerow = document.createElement('tr');
      for (let j = 0; j < 9; j++) {
        line.push(data_array ? data_array["" + i + "" + j] : 0);
        physicalLine.push(document.createElement('td'));
        physicalLine[j].innerHTML = data_array ? data_array["" + i + "" + j] == 0 ? "&cross;" : data_array["" + i + "" + j] : 0;
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



}