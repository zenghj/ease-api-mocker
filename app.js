'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require("express-session");
var RedisStore = require('connect-redis')(session);
var compression = require('compression');
var expressValidator = require('express-validator');
var successLogger = require('./middlewares/logger').successLogger;
var errorLogger = require('./middlewares/logger').errorLogger;
var router = require('./routes');
var mongoose = require('mongoose');
let config = require('config'); //we load the db location from the JSON files
const customValidators = require('./lib/customExpressValidator');
var app = express();

app.use(compression());
app.use(expressValidator({customValidators}));
//连接数据库
mongoose.Promise = Promise;
mongoose.connect( config.DBHost,{
    useMongoClient: true
}).catch(function(err){
    console.error(err);
});

//定义账户策略
require('./setup-passport');


var redisStore = new RedisStore({
    host: '127.0.0.1'
    ,port: '6379'
    ,ttl: 1000*3600*24
});
redisStore.on('disconnect', function(err){
    console.error(err);
})
redisStore.on('connect', function(){
    console.log('redis connection!');
})
app.use(session({
    store: redisStore
    ,secret: "LUp$Dg?,I#i&owP3=9su+OB%`JgL4muLF5YJ~{;t"
    ,resave: true
    ,saveUninitialized: true
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
const staticFilesOpt = {
  maxAge: 31536000000, // one year
}
app.use(express.static(path.join(__dirname, 'public'), staticFilesOpt));
app.use(express.static(path.resolve(__dirname, './client/dist/static'), staticFilesOpt));
app.use(expressValidator());

// 所有请求的简单日志
app.use(successLogger);

app.use(router);

// 请求发生错误的日志
app.use(errorLogger);


// 捕获404错误
app.use(function (req, res, next) {
    // var err = new Error('Not Found');
    // err.status = 404;
    // next(err);
    res.status(404).send('Not Found');
});

// 错误处理
// app.use(function (err, req, res, next) {
//     // 开发环境显示具体错误信息
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
    
//     // 渲染错误页面
//     res.status(err.status || 500);
//     res.render('error');
    
// });


module.exports = app; // for testing
