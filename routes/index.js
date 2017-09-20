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





module.exports = router;
