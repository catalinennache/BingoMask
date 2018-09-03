var express = require('express');
var router = express.Router();
var IService = require('../bin/internal');
var GCore = require('./../bin/GameCore');
/* GET home page. */
router.get('/', function (req, res, next) {


  if (req.session.user) {
    console.log("user found")
    res.render('home', { user: req.session.user });
  }
  else {
    console.log("guest found")
    res.render('home', { user: false });
  }
});
router.post('/', function (req, res, next) {
  try {
    //var data = IService.ExtractV2PostData(req);
    console.log(req.body);


    if (req.body.email && req.body.pass) {
      IService.AuthenticateUser(req.body.email, req.body.pass).then((result) => {
        console.log("RESULT", result);
        if (result['response'] != 0) {
          let params = result['response'].split("<>");
          req.session.user = params[0];
          req.session.userToken = params[1];
          res.render('home', { user: req.session.user });
          res.end();
        } else {
          res.writeHead(403, 0);
          res.end();
        }

      });
    }
  } catch (e) { console.log(e) }
})

router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.redirect('/')
  res.end();

})






router.post('/enterGame', function (req, res, next) {

  let gameSess = GCore.getGSession();
  let userSess = req.session;
  console.log("atmpt Game joining")
  if (!gameSess.isP1Locked()) {
      console.log("Service available");
    IService.GenerateTicket().then((ticket) => {
      console.log("ticket generated for ",req.session.userToken);

      if (gameSess.addPeer(userSess.userToken, ticket)) {
        let middleman = JSON.stringify(ticket);
        let tck = JSON.parse(middleman);
        let token = tck.token;
        delete tck.token;
        console.log("Peer added");
       
        res.send(JSON.stringify({ gsess_token: token, ticket: tck, chatSocket: gameSess.getChatURL() }));
        res.end();
      }else
    {
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
  let phase = gsess.getPhase();

  switch (phase) {
    case 0: {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({error:true,reason:0}));
      res.end();
    } break;

    case 1: {
      try{
      let ball = gsess.extractBallFor(usersession.userToken);
        console.log(ball);
      if (ball.number) {
        res.setHeader('Content-Type', 'application/json');
        
        res.send(JSON.stringify({error:false, ball: ball.number, index:ball.index }));
        res.end();
      } else {
        res.send(JSON.stringify({ error: true }));
        res.end();
      }}catch(e){console.log(e)}
    } break;

    case 2: {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({error:true,reason:2}));
      res.end();
        
    }
  }

})

module.exports = router;
