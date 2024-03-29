var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

var firstLevel = require('./routes/first-level');
var secondLevel = require('./routes/second-level');
var thirdLevel = require('./routes/third-level');
var imprint = require('./routes/imprint');
var hbs = require('express-handlebars');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// registering partials
app.engine('hbs', hbs({
  extname: 'hbs', 
  layoutDir: __dirname + '/views/',
  partialsDir  : [
      //  path to your partials
      __dirname + '/views/partials',
  ]
}));

app.set('view engine', 'hbs');

// app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));


app.use('/', firstLevel);
app.use('/second', secondLevel);
app.use('/third', thirdLevel);
app.use('/imprint', imprint);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

module.exports = app;
