var express = require('express');
var router = express.Router();
var IService = require('../bin/internal');
var GCore = require('./../bin/GameCore');
var dict = require('./../bin/error_dict');
/* GET home page. */
router.get('/', function (req, res, next) {



  if (req.session.user) {
    console.log("user found")
    res.render('home', { user: req.session.user, err: (req.query.err? req.query.err:"") });
  }
  else {
    console.log("guest found")
    res.render('home', { user: false, err: (req.query.err? req.query.err:"") });
  }
});
router.post('/', function (req, res, next) {
  try {
    
    // TO DO -> Secure NickName
   
    if (req.body.email && req.body.pass && (req.body.pass == req.body.passconf)) {
      IService.Register(req.body.nick,req.body.email,req.body.pass,req.body.passconf).then((result)=>{
        console.log("RESULT", result);
        if (result['response'] != 0) {
          let params = result['response'].split("<>");
          req.session.user = params[0];
          req.session.userToken = params[1];
          res.render('home', { user: req.session.user });
         
        } else {
          res.writeHead(403, 0);
          res.end();
        }
      })

      
    } else {
      if (req.body.email && req.body.pass) {
        IService.AuthenticateUser(req.body.email, req.body.pass).then((result) => {
          console.log("RESULT", result);
          if (result['response'] != 0) {
            let params = result['response'].split("<>");
            req.session.user = params[0];
            req.session.userToken = params[1];
            res.render('home', { user: req.session.user });
           
          } else {
            res.writeHead(403, 0);
            res.end();
          }

        });
      }
    }
 



  } catch (e) { console.log(e) }
})
router.post('/check', function (req, res, next) {
  try {
    if (req.body.nick) {

      IService.CheckNickname(req.body.nick).then((e) => {
        console.log(e);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ available: e.ok , message: dict['sucode']['1'] }));
        res.end();

      })

    } else {
    }
  } catch (e) { console.log(e); }
})
router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.redirect('/')
  res.end();

})


module.exports = router;
