var router = require('express').Router();
var core = require('./../bin/GameCore');
var gamesession;
router.get('/', function (req, res, next) {
    try { gamesession = core.getGSession();
      let info = gamesession.getInfo();
      console.log(req.session.gameId, info.gameId);
        if (req.session.user && req.session.gameId ==  info.gameId) {    //   gamesession =  !gamesession? core.getGSession() :gamesession;
            //   gamesession.addPeer({token:Math.random(),ticket:{token:Math.random()}});
           
            
            res.render('gameroom', { user: req.session.user, info: info , bearer:req.session.pack_token});
        }
        else
            res.redirect('/');
    } catch (e) {
        console.log(e);
    }
});

router.post('/enterGame', function (req, res, next) {

    let gameSess = GCore.getGSession();
    let userSess = req.session;
    console.log("atmpt Game joining")
    if (!gameSess.isP1Locked()) {
      console.log("Service available");
      IService.GenerateTicket().then((ticket) => {
        console.log("ticket generated for ", req.session.userToken);
  
        if (gameSess.addPeer(userSess.userToken, ticket)) {
          let middleman = JSON.stringify(ticket);
          let tck = JSON.parse(middleman);
          let token = tck.token;
          delete tck.token;
          console.log("Peer added");
  
          res.send(JSON.stringify({ gsess_token: token, ticket: tck, chatSocket: gameSess.getChatURL() }));
          res.end();
        } else {
          res.writeHead(425);
          res.end();
        }
  
      });
  
  
    }
    else
      res.redirect('spectate');
  
  
  
  
    /*
      console.log(req.body);
      try {
        IService.GenerateTicket().then((ticket) => {
          console.log(ticket);
          res.writeHead(425, 0);
          res.end();
        })
      } catch (e) { console.log(e) }
    */
    // 
  })
  router.post('/update', function (req, res, next) {
    let usersession = req.session;
    let gsess = GCore.getGSession();
    let phase = gsess.getPhase()['index'];
     
    switch (phase) {
      case 0: {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ error: true, reason: 0 }));
        res.end();
      } break;
  
      case 1: {
        try {
          let ball = gsess.extractBallFor(usersession.userToken);
          console.log(ball);
          if (ball.number) {
            res.setHeader('Content-Type', 'application/json');
  
            res.send(JSON.stringify({ error: false, ball: ball.number, index: ball.index }));
            res.end();
          } else {
            res.send(JSON.stringify({ error: true }));
            res.end();
          }
        } catch (e) { console.log(e) }
      } break;
  
      case 2: {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ error: true, reason: 2 }));
        res.end();
  
      }
    }
  
  })
  


module.exports = router;