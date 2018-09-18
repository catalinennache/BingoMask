
var router = require('express').Router();
var gameCore = null;


var IService = require('./../bin/internal');
router.get('/', function (req, res, next) {
    if (!gameCore) gameCore = require('./../bin/GameCore');
    var gamesession = gameCore.getGSession();
   
    if (!req.session.pack_token || req.session.gameId != gamesession.getInfo().gameId) {

        try {

            if (req.session.user) {

                let phase = gamesession.getPhase();

                console.log(phase.timmer - new Date(), phase.timmer - new Date() > 2000);
                if ((phase['index'] == 0 && phase.timmer - new Date() > 2000) || true) {

                    let info = gamesession.getInfo();
                    res.render('preflight', { user: req.session.user, timmer: phase['timmer'], info: info });

                }




            } else
                res.redirect('/');
        } catch (e) {
            console.log(e);
        }
    } else {
        res.redirect('/gameroom');
    }
})

router.post('/init', function (req, res, next) {
    if (req.session.userToken) {
        IService.Generate6pack().then(data => {

            let deadline = gameCore.getGSession().getPhase();

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ tickets: data, deadline: deadline.timmer }));
        })
    } else {
        res.writeHead(403);
    }

});

router.post('/regenerate', function (req, res, next) {
    try {
        let gamesession = gameCore.getGSession();
        if (req.session.userToken && !gamesession.isP1Locked()) {
            IService.Generate6pack().then(data => {

                let deadline = gamesession.getPhase();
                let payload;
                for (let i = 0; i < data.length - 1; i++)
                    payload[Object.keys(data)[i]] = data[i];

                // payload = JSON.parse(JSON.stringify(payload));    
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ tickets: data }));
            })
        } else {
            res.writeHead(403);
            res.end();
        }
    } catch (e) { console.log(e) }
})

router.post('/go', function (req, res, next) {
    try {
        var params = JSON.parse(req.body.params);
        console.log(params['pack_token']);
        console.log(params['0'])
        if ((params['pack_token'] != null && params['pack_token'] != "") && (params['gameId'] != null && params['gameId'] != "")) {
            let pack = [];

            for (let i in params) {
                try {
                    let ticket = {};
                    ticket = params[i].ticket;
                    ticket.id = params[i].id;
                    pack.push(ticket);
                } catch (e) {

                }
            }

            if (pack.length == 6) {
                let sess = gameCore.getGSession();
                sess.addPeer(params.pack_token, req.session.userToken, JSON.stringify(pack));
                req.session.pack_token = params.pack_token;
                req.session.pack = JSON.stringify(pack);
                req.session.gameId = params.gameId;
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ goodtogo: true }));
            } else {
                // caz ce trebuie tratat mai devreme sau mai tarziu
            }
        }
    } catch (e) {
        console.log(e);
        try { console.log(params['pack_token']); } catch (es) { console.log(es) }

    }
})
module.exports = router;