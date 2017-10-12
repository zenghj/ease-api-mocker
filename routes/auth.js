
'use strict';
const express = require('express');
const router = express.Router();
const passport = require("passport");
const path = require('path');
const User = require('../db').User;
const routeMap = require('./config');



// 注册页
router.route("/signup")
    .get(function (req, res) {
        console.log(req.isAuthenticated());
        if (req.isAuthenticated()) {
            res.redirect(routeMap.home);
        } else {
            res.sendFile(path.resolve(__dirname, '../views/signup.html'));
        }

    })
    .post(function (req, res, next) {
        var username = req.body.username;
        var password = req.body.password;

        User.findOne({ username: username }, function (err, user) {
            

            if (err) { return next(err); }
            if (user) {
                return res.status(400).send({
                    status: 400,
                    message: 'User already exists'
                });
            }

            User.create({
                username: username,
                password: password
            }, function(err, data) {
                if(err){
                    console.error('创建用户失败');
                    return next(err);
                }
                next(null);
            });

        });
    }, passport.authenticate("login", {
        successRedirect: routeMap.home,
        failureRedirect: routeMap.signup,
        failureFlash: true
    }));

// 登陆页
router.route("/login")
    .get(function (req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect(routeMap.home)
        } else {
            res.sendFile(path.resolve(__dirname, '../views/login.html'));
        }
    })
    .post(passport.authenticate('login', { failureRedirect: routeMap.login }), function (req, res) {
        var redirectTo = req.session.redirectTo || routeMap.home;
        delete req.session.redirectTo;
        req.session.username = req.body.username; // 把用户名存入session
        return res.redirect(redirectTo);
    });

// 登出
router.get('/logout', function (req, res, next) {
    req.logout();
    delete req.session.username;
    res.redirect(routeMap.login);
});


// 更改密码接口


module.exports = router;