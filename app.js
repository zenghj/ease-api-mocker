'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require("express-session");
var mongoose = require('mongoose');
var flash = require("connect-flash");
var successLogger = require('./middlewares/logger').successLogger;
var errorLogger = require('./middlewares/logger').errorLogger;
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost:27017/easy-api", {
    useMongoClient: true
});
require('./setup-passport');



var router = require('./routes');
var authRouter = require('./routes/auth');

var app = express();

app.use(session({
    secret: "LUp$Dg?,I#i&owP3=9su+OB%`JgL4muLF5YJ~{;t",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 正常请求的日志
app.use(successLogger);

app.use(router);

// 错误请求的日志
app.use(errorLogger);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    console.log(err.message);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    
    // render the error page
    res.status(err.status || 500);
    res.render('error');
    
});





module.exports = app;
