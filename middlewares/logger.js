const winston = require('winston');
const expressWinston = require('express-winston');
const path = require('path');
const routeMap = require('../routes/config');

const privateRoutes = [
  `post ${routeMap.signup}`,
  `post ${routeMap.login}`,
]
function ignorePrivateRoute (req, res) {
  var routeInfo =  `${req.method.toLowerCase()} ${req.path}`;
  return privateRoutes.indexOf(routeInfo) > -1;
}

const successLogger = expressWinston.logger({
    transports: [
        new (winston.transports.Console)({
            // json: true,
            colorize: true
            ,level: 'silly'
            ,label: 'BL'
        }),
        new winston.transports.File({
            filename: path.resolve(__dirname, '../logs/success.log'),
            maxsize: 10000000,
            maxFiles: 10
        })
    ]
    ,msg: "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{decodeURIComponent(req.url)}} {{JSON.stringify(req.body)}}" // optional: customize the default logging message. 
    // , expressFormat: true
    ,meta: false
    ,colorize: true
    ,ignoreRoute: ignorePrivateRoute
});

const errorLogger = expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: path.resolve(__dirname, '../logs/error.log'),
            maxsize: 10000000,
            maxFiles: 10
        })
    ]
    ,ignoreRoute: ignorePrivateRoute
});

module.exports = {
    successLogger: successLogger,
    errorLogger: errorLogger
}
