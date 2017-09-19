'use strict';
const routeMap = require('../routes/config');
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.session.redirectTo = req.originalUrl;
        res.redirect(routeMap.login);
    }
};


module.exports = {
    checkAuth: isAuthenticated
};