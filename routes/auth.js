
'use strict';
var express = require('express');
var router = express.Router();
var passport = require("passport");
var path = require('path');
var User = require('../db').User;
var routeMap = require('./config');




// 注册页
router.get("/signup", function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect(routeMap.home);
    } else {
        res.sendFile(path.resolve(__dirname, '../views/signup.html'));
    }

});


// 登陆页
router.get("/login", function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect(routeMap.home)
    } else {
        res.sendFile(path.resolve(__dirname, '../views/login.html'));
    }
});


// 登出
router.get('/logout', function (req, res, next) {
    req.logout();
    delete req.session.username;
    res.redirect(routeMap.login);
});


// 注册接口
router.post("/signup", function (req, res, next) {

    var username = req.body.username;
    var password = req.body.password;

    User.findOne({ username: username }, function (err, user) {

        if (err) { return next(err); }
        if (user) {
            req.flash("error", "User already exists");
            return res.redirect(routeMap.signup);
        }

        var newUser = new User({
            username: username,
            password: password
        });
        newUser.save(next);

    });
}, passport.authenticate("login", {
    successRedirect: routeMap.home,
    failureRedirect: routeMap.signup,
    failureFlash: true
}));


// 登陆接口
router.post('/login',
    passport.authenticate('login', { failureRedirect: routeMap.login }),
    function (req, res) {
        var redirectTo = req.session.redirectTo || routeMap.home;
        delete req.session.redirectTo;
        req.session.username = req.body.username; // 把用户名存入session
        return res.redirect(redirectTo);
    });

module.exports = router;