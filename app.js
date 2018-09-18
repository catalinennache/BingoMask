var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var http=require('http');
var querystring = require('querystring');
var session=require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var errDictionary = require('./routes/errdic')
var preflightRouter = require('./routes/preflight.js');
var gameroomRouter = require('./routes/gameroom.js');
var app = express();
var cors  = require('cors');
var corsOptions = {
    origin: 'http://86.123.134.100:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
var test = require('./bin/internal');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(session({
    secret: 'JosCenzura',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 999999900000 }
}))
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'));
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use('/', indexRouter);
app.use('/user',usersRouter);
app.use('/preflight',preflightRouter);
app.use('/gameroom',gameroomRouter);
app.use('/errdic',errDictionary);
 var i=0;
//setInterval(function(){try{PostTest(35300)}catch(Exception){}},2050);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


function PostTest(Port) {
  // Build the post string from an object
  var post_data = querystring.stringify({
      'fuck' : 'you'     
  });

  var post_options = {
      host: 'localhost',
      port: Port,
      path: '/',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();
  console.log("SENT REQ: "+(++i));

}

module.exports = app;
