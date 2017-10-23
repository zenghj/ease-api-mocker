'use strict';
const routeMap = require('../routes/config');
const checkAuth = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.session.redirectTo = req.originalUrl;
        res.redirect(routeMap.login);
    }
};


const apiCheckAuth = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {

        // 视客户端异步请求框架能不能辨别status再决定要不要给具体的错误信息
        // 比如ajax会带，暂时不这样写error msg
        // res.status(401).send({
        //     error: 'this request is unauthorized.',
        //     state: 401
        // });

        // 尽量不要提前处理返回错误信息，都放到next(err)去处理，便于日志的统一管理
        // 这种级别的信息应该不需要打日志所以还是直接sendStatus
        return res.status(401).send({
            status: 401
            ,message: '用户未登录'
        });
        // let error = new Error('unauthorized');
        // error.status = 401;
        // next(error);
    }
};

module.exports = {
    checkAuth: checkAuth,
    apiCheckAuth: apiCheckAuth
};