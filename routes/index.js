'use strict';
var express = require('express');
var router = express.Router();
var passport = require("passport");
var path = require('path');
var User = require('../db').User;



var isAuthenticated = function (req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login')
  }
};


// 注册页
router.get("/signup", function (req, res) {
    if(req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.sendFile(path.resolve(__dirname, '../views/signup.html'));
    }
    
});

// 注册接口
router.post("/signup", function (req, res, next) {

    var username = req.body.username;
    var password = req.body.password;

    User.findOne({ username: username }, function (err, user) {

        if (err) { return next(err); }
        if (user) {
            req.flash("error", "User already exists");
            return res.redirect("/signup");
        }

        var newUser = new User({
            username: username,
            password: password
        });
        newUser.save(next);

    });
}, passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/signup",
    failureFlash: true
}));

// 登陆页
router.get("/login", function(req, res, next){
    if(req.isAuthenticated()) {
        res.redirect('/')
    } else {
        res.sendFile(path.resolve(__dirname, '../views/login.html'));
    }
});


// 登陆接口
router.post('/login',
    passport.authenticate('login', { failureRedirect: '/login' }),
    function (req, res) {
        return res.redirect('/');
    });

// logout
router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/login');
});


router.get('/', isAuthenticated, function(req, res) {
    res.sendFile(path.resolve(__dirname, '../views/index.html'));
});






module.exports = router;
