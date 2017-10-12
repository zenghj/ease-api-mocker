'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require("express-session");
var successLogger = require('./middlewares/logger').successLogger;
var errorLogger = require('./middlewares/logger').errorLogger;
var router = require('./routes');
var mongoose = require('mongoose');

//连接数据库
mongoose.Promise = Promise;
mongoose.connect("mongodb://ace:ace@localhost:27017/easy-api",{
    useMongoClient: true
}).catch(function(err){
    console.error(err);
});

//定义账户策略
require('./setup-passport');

var app = express();

app.use(session({
    secret: "LUp$Dg?,I#i&owP3=9su+OB%`JgL4muLF5YJ~{;t",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000*3600*24
    }
}));
app.use(passport.initialize());
app.use(passport.session());


// 设置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 设置favicon
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));

//格式化application/x-www-form-urlencoded和application/json数据
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 正常请求的日志
app.use(successLogger);

app.use(router);

// 错误请求的日志
app.use(errorLogger);


// 捕获404错误
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// 错误处理
app.use(function (err, req, res, next) {
    console.log(err.message);
    // 开发环境显示具体错误信息
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    
    // 渲染错误页面
    res.status(err.status || 500);
    res.render('error');
    
});


module.exports = app;
