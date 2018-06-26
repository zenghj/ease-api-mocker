'use strict';
const express = require('express');
const router = express.Router();
const passport = require("passport");
const path = require('path');
const User = require('../db').User;
const routeMap = require('./config');
const bcrypt = require("bcrypt-nodejs");
const toonavatar = require('cartoon-avatar');

// baseUrl: '/auth'
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
                        max: 20
                    },
                    errorMessage: '用户名长度须为3-20位'
                }
            },
            password: {
                notEmpty: {
                    errorMessage: '密码不能为空'
                },
                isAlphanumeric: {
                    errorMessage: '密码需为数字或字母组合'
                },
                isLength: {
                    options: {
                        min: 6
                        ,max: 20
                        ,errorMessage: '密码长度需要为6-20个字符'
                    }
                }
            },
            // gender: {
            //     notEmpty: {
            //         errorMessage: '请勾选性别，用于决定生成随机头像的性别'
            //     }
            // }
        });
        let errors = req.validationErrors();
        if (errors) {
            return res.send({
                status: 400,
                message: errors[0].msg
            })
        }
        next();
    }, (req, res, next) => {
        /**
         * username @string
         * password @string
         * gender @string "male"或"female"
         */
        let {username, password, gender = 'male'} = req.body;

        User.findOne({ username }, function (err, user) {
            if (err) { return next(err); }
            if (user) {
                return res.status(400).send({
                    status: 400,
                    message: '用户名已被注册'
                });
            }
            let avatarOption = {'gender': gender}; 
            let avatar = toonavatar.generate_avatar(avatarOption);
            User.create({
                username
                ,password
                ,avatar
            }, function (err, data) {
                if (err) {
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
    // .get(function (req, res, next) {
    //     if (req.isAuthenticated()) {
    //         res.redirect(routeMap.home)
    //     } else {
    //         res.sendFile(routeMap.htmlFilePath);
    //     }
    // })
    .post( (req, res, next) => {
        //校验基本数据格式
        req.checkBody({
            username: {
                notEmpty: {
                    errorMessage: '用户名不能为空'
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
    }, passport.authenticate('login', { failWithError: true  }), function (req, res, next) {
        var redirectTo = req.session.redirectTo || routeMap.home;
        delete req.session.redirectTo;
        req.session.username = req.body.username; // 把用户名存入session // 其实不用这么写，登陆之后req.user就可以获取到user的全部信息
        return res.redirect(redirectTo);
    }, function(err, req, res, next) {
        // if(req.xhr) { 
            return res.status(400).json({
                status: 400,
                message: "用户名或密码不正确",
                error: err
            });
        // }
        // return res.redirect(routeMap.login);
    });

// 登出
router.get('/logout', function (req, res, next) {
    req.logout();
    // delete req.session.username;
    res.redirect(routeMap.loginPage);
});


// 更改密码接口 // 这个写的应该有问题
router.post('/resetpwd', (req, res, next) => {
    let password = req.body.password;
    let newPassword = req.body.newPassword;
    
    //校验基本数据格式
    req.checkBody({
        username: {
            notEmpty: {
                errorMessage: '用户名不能为空'
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
            },
            isAlphanumeric: {
                errorMessage: '密码至少6位数字或字母组合'
            },
            isLength: {
                options: {
                    min: 6
                    ,max: 20
                    ,errorMessage: '密码至少6位数字或字母组合'
                }
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
});

module.exports = router;