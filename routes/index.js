var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req,res,next){
  console.log("Some fuck tried to post on index");
  
  res.render('error');
})

module.exports = router;
