'use strict';

const routeMap = {
    home: '/',
    signup: '/auth/signup',
    login: '/auth/login',
    logout: '/auth/logout',
    project: {
        'C': '/api/projects/:projectName',
        'R': '/api/projects',
        'U': '/api/projects/:projectId',
        'D': '/api/projects/:projectId',
        'search': '/api/search/projects'
    },
    api: {
        'C': '/api/projects/:projectId/:APIName',
        'R': '/api/projects/:projectId/:apiId',
        'U': '/api/projects/:projectId/:apiId',
        'D': '/api/projects/:projectId/:apiId',
        'search': '/api/search/:projectId/apis',
        'allInThisProj': '/api/:projectId/apis'
    }

};


module.exports =  routeMap;
