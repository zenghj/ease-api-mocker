'use strict';
var express = require('express');
var router = express.Router();
var passport = require("passport");
var path = require('path');
var User = require('../db').User;
var routeMap = require('./config');
var checkAuth = require('../middlewares/checkauth').checkAuth;
var authRouter = require('./auth');
var apiRouter = require('./api');


router.use('/auth', authRouter);

router.get('/', checkAuth, function(req, res) {
    res.sendFile(path.resolve(__dirname, '../views/index.html'));
});

router.get('/project/:projectName', checkAuth, function(req, res) {
    res.sendFile(path.resolve(__dirname, '../views/api-list.html'));
});
router.get('/project/:projectName/:apiName', checkAuth, function(req, res) {
    res.sendFile(path.resolve(__dirname, '../views/api-detail.html'));
});

router.use('/api', apiRouter);

// catch 404 and forward to error handler
router.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
router.use(function (err, req, res, next) {
    console.log(err.message);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    
    // render the error page
    res.status(err.status || 500);
    res.render('error');
    
});




module.exports = router;
