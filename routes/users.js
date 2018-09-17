var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  try {
    if (req.session.user) {
      res.render('profile', { user: req.session.user });
    } else res.redirect('/')
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
