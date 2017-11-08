// const _ = require('underscore');
const httpMethods = ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'];
module.exports = {
    isHttpMethod: (value) => {
        if(httpMethods.indexOf(value) >= 0) return true;
        return false; 
    }
    
};


