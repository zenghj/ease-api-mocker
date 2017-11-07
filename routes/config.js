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
    }

};


module.exports =  routeMap;