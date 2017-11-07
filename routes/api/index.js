'use strict';
const express = require('express');
const router = express.Router();
const Project = require('../../db/project');
const Api = require('../../db/api');
const apiCheckAuth = require('../../middlewares/checkauth').apiCheckAuth;
const errorLogger = require('../../middlewares/logger').errorLogger;
const util = require('../../lib/util');
const _ = require('underscore');

const constVars = {
    projectQuery: 'id name updateBy updateAt isDeleted',
    apiQuery: 'name reqUrl',
    apiCanUpdate: 'projectName APIName reqUrl method canCrossDomain reqParams resParams successMock failMock reqMock',
    apiCanRead: 'id projectName APIName reqUrl method canCrossDomain reqParams resParams successMock failMock reqMock createAt createBy updateAt updateBy version isDeleted',
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
        createBy: username
    });
    newProject.save((err, savedProject) => {
        if (err) {
            if (err.code === 11000) {
                return res.status(400).send({
                    status: 400, // 400:当创建一个对象时，发生一个验证错误。
                    message: '该项目名在项目列表或回收站项目列表中已存在'
                });
            };
            return next(err);
        } else {
            return res.status(201).send({
                status: 201, // 201: [POST/PUT/PATCH]：用户新建或修改数据成功。
                result: savedProject,
                message: '创建成功'
            });
        }
    });
});

// 读取项目列表
// /api/projects
router.get('/projects', (req, res, next) => {
    let { limit = 10, page = 1 } = req.query;
    Project.paginate({
        isDeleted: false
    }, {
            page,
            limit,
            select: constVars.projectQuery
        }).then((result) => {
            result.status = 200;
            res.status(200).json(result);
        })
});

// 更改项目名称 （暂时不做是否已经在回收站的校验）
router.patch('/projects/:projectId', (req, res, next) => {
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
        return res.status(400).json({
            status: 400,
            message: errors[0].msg
        })
    }
    next();
}, (req, res, next) => {
    let projectId = req.params.projectId;
    let newName = req.body.newProjectName;

    Project.findByIdAndUpdate(projectId, {
        name: newName,
        updateAt: Date.now(),
        updateBy: req.session.username
    }, (err, doc) => {
        if (err) {
            return next(err);
        }
        if (doc) {
            return res.status(201).json({
                status: 201,
                message: '更新成功'
                // 直接返回doc给用户的话会是更新前的值（有点滞后）
                //（如有必要可以用findOneById, 然后doc.save实现来避免这个问题）
                // ,result: doc 

            });
        } else {
            return res.status(404).json({
                status: 404,
                message: '更新的项目不存在'
            })
        }
    });
}
);

// 删除项目
router.delete('/projects/:projectId', (req, res, next) => {
    let projectId = req.params.projectId;
    let isForceDelete = req.body.isForceDelete;
    if (isForceDelete === 'true') {
        // 完全删除
        Project.findOneAndRemove({ id: projectId }, (err, doc) => {
            if (err) {
                return next(err);
            }
            if (doc) {
                Api.find({ projectId: projectId })
                    .remove((err, writeOpResult) => {
                        if (err) {
                            return next(err);
                        }

                        res.sendStatus(204);// 204删除成功
                    });


            } else {
                res.send({
                    status: '404',
                    message: '该项目不存在'
                })
            }
        });
    } else {
        // 移入回收站
        Project.findOneAndUpdate({ id: projectId }, {
            isDeleted: true
        }, (err, doc) => {
            if (err) {
                // console.log(err);
                return next(err);
            }
            if (doc) {
                Api.update({ projectId: projectId }, {
                    isDeleted: true
                }, (err) => {
                    if (err) {
                        return next(err);
                    }
                    res.sendStatus(204);// 204删除成功
                })
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

router.get('/projects/:projectId/apis', (req, res, next) => {
    let projectId = req.params.projectId;
    let pageSize = Number.parseInt(req.query.pageSize, 10);
    let pageNo = Number.parseInt(req.query.pageNo, 10);
    if (pageSize && pageNo) {
        //分页获取
        Api.find({
            isDeleted: false
        }).paginate({
            projectId: projectId
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
            isDeleted: false,
            projectId: projectId
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


// 创建api
router.post('/projects/:projectId/:APIName', checkAPI, (req, res, next) => {
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
                    if (doc) {
                        return res.status(422).send({
                            status: 422,
                            message: `该项目下或回收站中名为“${APIName}”的接口已存在`
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
});


router.route('/projects/:projectId/:apiId')
    .put(checkAPI, (req, res, next) => {
        // 更新api数据
        let { projectId, apiId } = req.params;
        let update = {};

        Object.keys(req.body).forEach((key) => {
            if (constVars.apiCanUpdate.indexOf(key) >= 0) {
                // 防止不允许用户更新的字段被更新
                update[key] = req.body[key];
            }
        });

        Api.findOneAndUpdate({
            projectId,
            id: apiId
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
        let { projectId, apiId } = req.params;
        Api.findOne({
            projectId,
            id: apiId
        }, constVars.apiCanRead).exec((err, api) => {
            if (err) {
                return next(err);
            }
            if (api) {
                return res.send(api);
            }
            return res.status(404).send({
                status: 404,
                message: `id为${projectId}项目下不存在id为 ${apiId} 的接口`
            });
        })

    })
    .delete((req, res, next) => {
        let { projectId, apiId } = req.params;
        let isForceDelete = req.body.isForceDelete;

        if (isForceDelete === 'true') {
            // 彻底删除
            Api.findOne({
                projectId: projectId,
                id: apiId
            }, (err, doc) => {
                if (err) {
                    return next(err);
                }
                if (doc) {
                    Api.remove({
                        projectId,
                        id: apiId
                    }, (err) => {
                        if (err) {
                            return next(err);
                        }
                        return res.sendStatus(204); // 204: [DELETE]：用户删除数据成功。
                    })
                }

                return res.status(404).send({
                    status: 404,
                    message: `id为${projectId}的项目下不存在id为 ${apiId} 的接口`
                })
            });
        } else {
            // 放入回收站
            Api.findOneAndUpdate({
                projectId: projectId,
                id: apiId
            }, { isDeleted: true }, (err, doc) => {
                if (err) {
                    return next(err);
                }
                if (doc) {
                    return res.sendStatus(204);
                }
                return res.status(404).send({
                    status: 404,
                    message: `id为${projectId}的项目下不存在id为 ${apiId} 的接口`
                })
            });
        }

    });

// 项目搜索【名称、创建人、时间】暂时只写名称(忽略大小写) 
// 暂未排除已经删除到回收站的结果
router.get('/search/projects', (req, res, next) => {
    let { keyword = '', page = 1, limit = 10 } = req.query;
    // console.log(req.query);
    if (keyword === '') {
        return res.status(400).json({
            status: 400,
            message: 'keyword不能为空'
        });
    }

    Project.paginate({
        name: new RegExp(keyword, 'i')
        // name: keyword
    }, { page: page, limit: limit }, (err, results) => {
        if (err) {
            if (err.docs && err.docs.length === 0) {
                // 查询结果为[]
                return res.status(200).json({
                    status: 200,
                    result: err,
                    keyword: keyword
                });
            }
            console.log('-------');
            console.log(err);
            return next(err);
        } else {
            return res.status(200).json({
                status: 200,
                result: results,
                keyword: keyword
            });
        }
    })

});

// api搜索
// 暂未排除已经删除到回收站的结果
router.get('/search/:projectName/apis', (req, res, next) => {
    let { keyword, projectId, pageNo, pageSize } = req.query;

    if (keyword && projectId && pageNo && pageSize) {
        Api.find({
            APIName: new RegExp(keyword, 'i')
            , projectId
        }, constVars.apiCanRead).paginate({
            page: pageNo,
            limit: pageSize
        }).then((err, results) => {
            if (err) {
                return next(err);
            }
            return res.send(docs || []);
        });
    } else {
        // keyword为空怎么返回？到时候定
        return res.sendStatus(400);
    }
})


// '/api'下的错误日志
router.use(errorLogger);

router.use((err, req, res, next) => {
    //只处理500未知错误
    return res.status(500).send({
        error: err,
        status: 500,
        message: err.message || '未知服务器错误'
    })
});

module.exports = router;