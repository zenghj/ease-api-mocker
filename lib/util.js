'use strict';

const _ = require('underscore');



module.exports = {
    deepCopy: (obj) => {
        if (_.isObject(obj) || _.isArray(obj)) {
            return JSON.parse(JSON.stringify(obj));
        }
        return null;
    }
}