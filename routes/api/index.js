'use strict';
const express = require('express');
const router = express.Router();
const Project = require('../../db/project');
const Api = require('../../db/api');
const apiCheckAuth = require('../../middlewares/checkauth').apiCheckAuth;
const errorLogger = require('../../middlewares/logger').errorLogger;
const util = require('../../lib/util');

const constVars = {
    projectQuery: 'name updateBy updateAt isDeleted',
    apiQuery: 'name reqUrl',
    apiCanUpdate: 'projectName APIName reqUrl method canCrossDomain reqParams resParams successMock failMock reqMock',
    apiCanRead: 'projectName APIName reqUrl method canCrossDomain reqParams resParams successMock failMock reqMock createAt createBy updateAt updateBy version isDeleted',
    duplicateCode: 11000
};

// 这里统一处理'/api/**/*'路由下的鉴权
router.use(apiCheckAuth);
// 存储的时间，更新的时间需要处理，mongo存的是UTC格式的，暂定前端输出时处理


// baseUrl: '/api'
// 创建项目
// /api/projects/:projectName
router.post('/projects/:projectName', (req, res, next) => {
    let username = req.session.username;
    let projectName = req.params.projectName;
    let newProject = new Project({
        name: projectName,
        createBy: username,
        updateBy: username
    });
    newProject.save((err, savedProject) => {
        if (err) {
            if (err.code === 11000) {
                return res.status(500).send({
                    status: '500',
                    message: '项目名已存在'
                });
            };
            return res.status(500).send({
                status: '500',
                message: '创建项目失败'
            });
        } else {
            return res.send({
                status: 200,
                result: savedProject
            });
        }
    });
});

// 读取项目列表
// /api/projects
router.get('/projects', (req, res, next) => {
    let projects = [];
    let { pageSize, pageNo } = req.query;
    if (pageSize > 0 && pageNo > 0) {
        // 分页
        Project.paginate({}, {
            page: pageNo,
            limit: pageSize,
            select: constVars.projectQuery
        }).then((result) => {
            result.pageSize = result.limit;
            delete result.limit;
            res.send(result);
        })
    } else {
        // 不分页
        Project.find({}, constVars.projectQuery, (err, docs) => {
            if (err) {
                return res.status(500).send({
                    message: 'cannot get the project list.'
                });
            }
            return res.send(docs);
        })
    }

});

// 更改项目名称
router.patch('/projects/:projectName', (req, res, next) => {
    //校验基本数据格式
    req.checkBody({
        newProjectName: {
            notEmpty: {
                errorMessage: '新项目名称不能为空'
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
    let oldName = req.params.projectName;
    let newName = req.body.newProjectName;

    Project.findOneAndUpdate({ name: oldName }, {
        name: newName,
        updateAt: Date.now(),
        updateBy: req.session.username
    }, (err, doc) => {
        if (err) {
            return next(new Error('fail to update project name.'));
        }
        if (doc) {
            res.sendStatus(201);
        } else {
            res.send({
                status: '404',
                message: '更新的项目不存在'
            })
        }
    });
}
);

// 删除项目
router.delete('/projects/:projectName', (req, res, next) => {
    let projectName = req.params.projectName;
    let isForceDelete = req.body.isForceDelete;
    if (isForceDelete === 'true') {
        // 完全删除
        Project.findOneAndRemove({ name: projectName }, (err, doc) => {
            if (err) {
                return next(err);
            }
            if (doc) {
                res.sendStatus(204);// 204删除成功
            } else {
                res.send({
                    status: '404',
                    message: '该项目不存在'
                })
            }
        });
    } else {
        // 移入回收站
        Project.findOneAndRemove({ name: projectName }, {
            isDeleted: true
        }, (err, doc) => {
            if (err) {
                // console.log(err);
                return next(err);
            }
            if (doc) {
                res.sendStatus(204);// 204删除成功
            } else {
                res.send({
                    status: '404',
                    message: '该项目不存在'
                })
            }
        })
    }

});

// 读取当前项目apis

router.get('/projects/:projectName/apis', (req, res, next) => {
    let projectName = req.params.projectName;
    let pageSize = Number.parseInt(req.query.pageSize, 10);
    let pageNo = Number.parseInt(req.query.pageNo, 10);
    if (pageSize && pageNo) {
        //分页获取
        Api.paginate({
            belongTo: projectName
        }, {
                page: pageNo,
                limit: pageSize,
                select: constVars.apiCanUpdate
            }).then((result) => {
                res.send(result);
            })

    } else {
        // 不分页
        Api.find({
            belongTo: projectName
        }, constVars.apiCanRead, (err, docs) => {
            if (err) {
                return next(err);
            }
            return res.send(docs || []);
        });
    }

});

function checkAPI(req, res, next) {
    //校验基本数据格式
    req.checkBody({
        projectName: {
            notEmpty: {
                errorMessage: '项目名不能为空'
            }
        }
        , APIName: {
            notEmpty: {
                errorMessage: '接口名不能为空'
            }
        }
        , reqUrl: {
            notEmpty: {
                errorMessage: '接口名不能为空'
            }
            , isURL: {
                errorMessage: '接口路径错误'
            }
        }
        , method: {
            notEmpty: {
                errorMessage: '接口名不能为空'
            }
        }
        , reqParams: {
            custom: function (value) {
                if (value) {
                    try {
                        let res = JSON.parse(value);
                        if (!Array.isArray(res)) {
                            return false;
                        }
                    } catch (err) {
                        next(err);
                        return false;
                    }
                }
                return true;
            }
        }
        , resParams: {
            custom: function (value) {
                if (value) {
                    try {
                        let res = JSON.parse(value);
                        if (!Array.isArray(res)) {
                            return false;
                        }
                    } catch (err) {
                        next(err);
                        return false;
                    }
                }
                return true;
            }
        }
        , successMock: {
            notEmpty: {
                errorMessage: '返回成功数据不能为空'
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
}
router.route('/projects/:projectName/:APIName')
    .post(checkAPI, (req, res, next) => {
        //校验基本数据格式
        req.checkBody({
            reqUrl: {
                notEmpty: {
                    errorMessage: '接口名不能为空'
                }
                , isURL: {
                    errorMessage: '接口路径错误'
                }
            }
            , method: {
                notEmpty: {
                    errorMessage: '接口名不能为空'
                }
            }
            , reqParams: {
                custom: function (value) {
                    if (value) {
                        try {
                            let res = JSON.parse(value);
                            if (!Array.isArray(res)) {
                                return false;
                            }
                        } catch (err) {
                            next(err);
                            return false;
                        }
                    }
                    return true;
                }
            }
            , resParams: {
                custom: function (value) {
                    if (value) {
                        try {
                            let res = JSON.parse(value);
                            if (!Array.isArray(res)) {
                                return false;
                            }
                        } catch (err) {
                            next(err);
                            return false;
                        }
                    }
                    return true;
                }
            }
            , successMock: {
                notEmpty: {
                    errorMessage: '返回成功数据不能为空'
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
        // 创建 api item
        let { projectName, APIName } = req.params;
        let { reqUrl, method, canCrossDomain, reqParams, resParams, successMock, failMock, reqMock } = req.body;
        canCrossDomain = (req.body.canCrossDomain === 'true' ? true : false);
        let sessionUserName = req.session.username;
        let api = {
            projectName
            , APIName
            , reqUrl
            , method
            , canCrossDomain
            , reqParams
            , resParams
            , successMock
            , failMock
            , reqMock
            , createBy: sessionUserName
            , updateBy: sessionUserName

        };

        Project.findOne({ name: projectName })
            .exec((err, project) => {
                if (err) {
                    return next(err);
                } else if (project) {
                    //检测端口是否已存在
                    Api.findOne({
                        projectName
                        , APIName
                    }, function (err, doc) {
                        if (err) {
                            return next(err);
                        }
                        if (!doc) {
                            return res.status(404).send({
                                status: 404,
                                message: `该项目下名为“${APIName}”的接口已存在`
                            })
                        }
                    })
                    let newApi = new Api(api);
                    newApi.save((err) => {
                        if (err) {
                            return next(err);
                        }
                        return res.sendStatus(201);
                    })

                } else {
                    return res.status(404).send({
                        status: 404,
                        message: `project: ${projectName} not exist`
                    });
                }
            })
    })
    .put(checkAPI, (req, res, next) => {
        // 更新api数据
        let { projectName, APIName } = req.params;
        let update = {};

        Object.keys(req.body).forEach((key) => {
            if (constVars.apiCanUpdate.indexOf(key) >= 0) {
                // 防止不允许用户更新的字段被更新
                update[key] = req.body[key];
            }
        });

        Api.findOneAndUpdate({
            projectName
            , APIName
        }, update, (err, doc) => {
            if (err) {
                return next(err);
            }
            if (doc) {
                // console.log(doc);
                let result = util.filterProp(doc, constVars.apiCanUpdate);
                return res.status(201).send(result);
            }
            return res.status(404).send({
                status: 404,
                message: `${projectName} 下不存在 ${APIName}`
            })
        })

    })
    .get((req, res, next) => {
        // 获取api详细内容
        let { projectName, APIName } = req.params;
        Api.findOne({
            projectName
            , APIName
        }, constVars.apiCanRead).exec((err, api) => {
            if (err) {
                return next(err);
            }
            if (api) {
                return res.send(api);
            }
            return res.status(404).send({
                status: 404,
                message: `${projectName}项目下不存在 ${APIName}`
            });
        })

    })
    .delete((req, res, next) => {
        let { projectName, APIName } = req.params;
        let isForceDelete = req.body.isForceDelete;

        if (isForceDelete === 'true') {
            // 彻底删除
            Api.findOneAndRemove({
                projectName
                , APIName
            }, (err) => {
                if (err) {
                    return next(err);
                }
                if (doc) {
                    return res.sendStatus(204);
                }
                return res.status(404).send({
                    status: 404,
                    message: `${projectName}项目下不存在 ${apiName}`
                })
            });
        } else {
            // 放入回收站
            Api.findOneAndUpdate({
                projectName
                , APIName
            }, { isDeleted: true }, (err, doc) => {
                if (err) {
                    return next(err);
                }
                if (doc) {
                    return res.sendStatus(204);
                }
                return res.status(404).send({
                    status: 404,
                    message: `${projectName}项目下不存在 ${apiName}`
                })
            });
        }

    });

// 项目搜索【名称、创建人、时间】暂时只写名称(忽略大小写)
router.get('/search/projects', (req, res, next) => {
    let keyword = req.query.keyword.trim();
    if (keyword) {
        Project.find({
            name: new RegExp(keyword, 'i')
        }, constVars.projectQuery, (err, docs) => {
            if (err) {
                return next(err);
            } else {
                return res.send(docs || []);
            }
        });
    } else {
        // keyword为空怎么返回？到时候定
        return res.sendStatus(404);
    }
});

// api搜索
router.get('/search/:projectName/apis', (req, res, next) => {
    var keyword = util.trim(req.query.keyword);
    var projectName = util.trim(req.params.projectName);
    if (keyword) {
        Api.find({
            APIName: new RegExp(keyword, 'i')
            , projectName
        }, constVars.apiCanRead, (err, docs) => {
            if (err) {
                return next(err);
            }
            return res.send(docs || []);
        });
    } else {
        // keyword为空怎么返回？到时候定
        return res.sendStatus(404);
    }
})


// '/api'下的错误日志
router.use(errorLogger);

router.use((err, req, res, next) => {
    //只处理500未知错误
    return res.status(500).send({
        error: err.message || 'server error',
        status: err.status || 500
    })
});

module.exports = router;