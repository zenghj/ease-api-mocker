
'use strict';
const express = require('express');
const router = express.Router();
const passport = require("passport");
const path = require('path');
const User = require('../db').User;
const routeMap = require('./config');
const bcrypt = require("bcrypt-nodejs");

// 注册页
router.route("/signup")
    .get(function (req, res) {
        if (req.isAuthenticated()) {
            res.redirect(routeMap.home);
        } else {
            res.sendFile(path.resolve(__dirname, '../views/signup.html'));
        }

    })
    .post( (req, res, next) => {
        //校验基本数据格式
        req.checkBody({
            username: {
                notEmpty: {
                    errorMessage: '用户名不能为空'
                },
                isLength: {
                    options: {
                        min: 3,
                        max: 10
                    },
                    errorMessage: '用户名须为3-10位的字符'
                }
            },
            password: {
                notEmpty: {
                    errorMessage: '密码不能为空'
                }
            }
        })
        let errors = req.validationErrors();
        if (errors) {
            return res.send({
                status: 400,
                message: errors[0].msg
            })
        }
        next();
    }, (req, res, next) => {
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
            }, function (err, data) {
                if (err) {
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
    .post( (req, res, next) => {
        //校验基本数据格式
        req.checkBody({
            username: {
                notEmpty: {
                    errorMessage: '用户名不能为空'
                },
                isLength: {
                    options: {
                        min: 3,
                        max: 10
                    },
                    errorMessage: '请输入有效用户名'
                }
            },
            password: {
                notEmpty: {
                    errorMessage: '密码不能为空'
                }
            }
        })
        let errors = req.validationErrors();
        if (errors) {
            return res.send({
                status: 400,
                message: errors[0].msg
            })
        }
        next();
    }, passport.authenticate('login', { failureRedirect: routeMap.login }), function (req, res) {
        var redirectTo = req.session.redirectTo || routeMap.home;
        delete req.session.redirectTo;
        req.session.username = req.body.username; // 把用户名存入session
        return res.redirect(redirectTo);
    });

// 登出
router.get('/logout', function (req, res, next) {
    req.logout();
    // delete req.session.username;
    res.redirect(routeMap.login);
});


// 更改密码接口
router.post('/resetpwd', (req, res, next) => {
    let password = req.body.password;
    let newPassword = req.body.newPassword;
    
    //校验基本数据格式
    req.checkBody({
        username: {
            notEmpty: {
                errorMessage: '用户名不能为空'
            },
            isLength: {
                options: {
                    min: 3,
                    max: 10
                },
                errorMessage: '请输入有效用户名'
            }
        },
        password: {
            notEmpty: {
                errorMessage: '原密码不能为空'
            }
        },
        newPassword:  {
            notEmpty: {
                errorMessage: '新密码不能为空'
            }
        }
    })
    let errors = req.validationErrors();
    if (errors) {
        return res.send({
            status: 400,
            message: errors[0].msg
        })
    }
    


    //验证原账户信息（用户名&&原密码）
    passport.authenticate('login', (err, user, info) => {
        if (err) { return next(err); }
        if (user) {
            //密码加密
            bcrypt.genSalt(10, function (err, salt) {
                if (err) { return next(err); }
                bcrypt.hash(newPassword, salt, function () { }, function (err, hashedPassword) {
                    if (err) { return next(err); }
                    User.update({
                        username: req.body.username
                    }, {
                            password: hashedPassword
                        }, function (err, user) {
                            if (err) { return next(err); }
                            res.send({
                                status: 200,
                                message: '密码修改成功'
                            })
                        })
                });
            });
        } else {
            res.send({
                status: 401,
                message: '用户不存在或密码错误'
            })
        }
    })(req, res, next);
})

module.exports = router;