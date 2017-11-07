'use strict';

// 根据str(字段以空格分隔)筛选数据库document中可以返回给用户看的数据
function filterProp(doc, str) {
    if(!doc) return {};
    if(!str) return doc;

    if(typeof str === 'string') {
        str = str.split(' ');
    } 
    let ret = {};
    str.forEach((key) => {
        doc[key] != null && (ret[key] = doc[key]);
    });
    return ret;
}

function trim(str) {
    str = String(str);
    if(!str) {
        return '';
    }
    return str.trim();
}




module.exports = {
    filterProp: filterProp,
    trim: trim
}