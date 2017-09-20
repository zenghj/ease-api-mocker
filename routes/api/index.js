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
    apiCanUpdate: 'name reqUrl method canCrossDomain mockRes belongTo',
    apiCanRead: 'name reqUrl method canCrossDomain mockRes isDeleted createAt createBy updateAt updateBy belongTo',
    duplicateCode: 11000
};




// 这里统一处理'/api/**/*'路由下的鉴权
router.use(apiCheckAuth);
// 存储的时间，更新的时间需要处理，mongo存的是UTC格式的，暂定前端输出时处理

// 创建项目
router.post('/projects/:projectName', (req, res, next) => {
    // /projects/ 不会被匹配上
    let username = req.session.username;
    let projectName = req.params.projectName;

    if (typeof username === 'undefined') {
        let error = new Error('session中获取不到用户名');
        return next(error);
        // return res.sendStatus(401); // 用户未登录  
    }
    // if(typeof projectName === 'undefined') {
    //     return res.status(404).send({
    //         error: '项目名称不能为空'
    //     });
    // }
    let newProject = new Project({
        name: projectName,
        createBy: username,
        updateBy: username
        // ,apis: new Api({})
    });
    newProject.save((err, savedProject) => {
        if (err) {
            // 触发这种返回还有可能是其他错误，但是返回给用户的是这种‘人性化欺骗-_-‘
            // console.log(err);
            // return res.status(500).send({
            //     error: `${projectName} has already existed`
            // });
            return res.status(400).send({
                message: `${projectName} has already existed`
            });
            // let error = new Error(`${projectName} has already existed`);
            // error.status = 400;
            // return next(error);
        } else {
            // return res.sendStatus(201);
            return res.json(savedProject); // 这样返回只是为了便于测试
        }
    });

});

// 读取项目列表
router.get('/projects', (req, res, next) => {
    let projects = [];
    let pageSize = Number.parseInt(req.query.pageSize, 10);
    let pageNo = Number.parseInt(req.query.pageNo, 10);
    if (pageSize && pageNo) {
        // 分页

        // 这种写法数据量大时性能不好
        // Project.find({})
        // .skip(page * 5)
        // .limit(5)
        // .sort({'_id':-1})
        // .exec(cb); 

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
    let oldName = req.params.projectName;
    let newName = req.body.name;
    if (typeof newName === 'undefined') {
        return res.sendStatus(400);
        // 400 [POST/PUT/PATCH]：用户发出的请求有错误，服务器没有进行新建或修改数据的操作，该操作是幂等的
    }
    Project.updateOne({ name: oldName }, {
        name: newName,
        updateAt: Date.now(),
        updateBy: req.session.username
    }, (err, doc) => {
        if (err) {
            return next(new Error('fail to update project name.'));
        }
        res.sendStatus(201);
    });
});

// 删除项目
router.delete('/projects/:projectName', (req, res, next) => {
    let projectName = req.params.projectName;
    let isForceDelete = req.body.isForceDelete;
    if (isForceDelete === 'true') {
        // 完全删除
        Project.remove({ name: projectName }, (err) => {
            if (err) {
                // console.log(err);
                // return res.status(500).send({
                //     message: `fail to delete project: $!{projectName}`
                // });
                return next(err);
            } else {
                return res.sendStatus(204);// 204删除成功
            }
        });
    } else {
        // 移入回收站
        Project.updateOne({ name: projectName }, {
            isDeleted: true
        }, (err) => {
            if (err) {
                // console.log(err);
                return next(err);
            } else {
                return res.sendStatus(204);
            }
        })
    }

});




// 读取当前项目apis

router.get('/projects/:projectName/apis', (req, res, next) => {
    let projectName = req.params.projectName;
    let limit = Number.parseInt(req.query.limit, 10);
    let pageNo = Number.parseInt(req.query.pageNo, 10);
    if(limit && pageNo) {
        //分页获取
        Api.paginate({
            belongTo: projectName
        }, {
            page: pageNo,
            limit: limit,
            select: constVars.apiCanUpdate
        }).then((result) => {
            res.send(result);
        })

    } else {
        // 不分页
        Api.find({
            belongTo: projectName
        }, constVars.apiCanRead, (err, docs) => {
            if(err) {
                return next(err);
            } 
            return res.send(docs || []);
        });
    }
   
});

router.route('/projects/:projectName/:apiName')
    .post((req, res, next) => {
        // 创建 api item
        let projectName = req.params.projectName;
        let apiName = req.params.apiName;
        let reqUrl = req.body.reqUrl;
        let method = req.body.method;
        let canCrossDomain = (req.body.canCrossDomain === 'true' ? true : false);
        let mockRes = JSON.parse((req.body.mockRes || '{}'));
    
        let api = {
            name: req.params.apiName,
            reqUrl: req.body.reqUrl,
            method: req.body.method,
            canCrossDomain: (req.body.canCrossDomain === 'true' ? true : false),
            mockRes: JSON.parse((req.body.mockRes || '{}')),
            createBy: req.session.username,
            updateBy: req.session.username,
            belongTo: projectName
    
        };
    
        Project.findOne({ name: projectName })
            .exec((err, project) => {
                if (err) {
                    return next(err);
                } else if (project) {
                    let newApi = new Api(api);
                    newApi.save((err) => {
                        if (err) {
                            if (err.code === constVars.duplicateCode) {
                                // E11000 duplicate key error index
                                return res.status(400).send({
                                    message: `${api.name} has already existed`
                                });
                            }
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
    .put((req, res, next) => {
        // 更新api数据
        let projectName = req.params.projectName;
        let apiName = req.params.apiName;
        let update = {};
        
        Object.keys(req.body).forEach((key) => {
            if(constVars.apiCanUpdate.indexOf(key) >= 0) {
                // 防止不允许用户更新的字段被更新
                update[key] = req.body[key];
            }
        });

        Api.findOneAndUpdate({
            belongTo: projectName, 
            name: apiName
        }, update, (err, doc) => {
            if(err) {
                return next(err);
            } 
            if(doc) {
                // console.log(doc);
                let result = util.filterProp(doc, constVars.apiCanUpdate);
                return res.status(201).send(result);
            } 
            return res.status(404).send({
                status: 404,
                message: `${projectName} 下不存在 ${apiName}`
            })
        })

    })
    .get((req, res, next) => {
        // 获取api详细内容
        let projectName = req.params.projectName;
        let apiName = req.params.apiName;
        Api.findOne({
            name: apiName, 
            belongTo: projectName
        }, constVars.apiCanRead).exec((err, api) => {
            if(err) {
                return next(err);
            }
            if(api) {
                return res.send(api);
            } 
            return res.status(404).send({
                status: 404,
                message: `${projectName}项目下不存在 ${apiName}`
            });
        })

    })
    .delete((req, res, next) => {
        let projectName = req.params.projectName;
        let apiName = req.params.apiName;
        let isForceDelete = req.body.isForceDelete;

        if(isForceDelete === 'true') {
            // 彻底删除
            Api.remove({
                name: apiName,
                belongTo: projectName
            }, (err) => {
                if(err) {
                    return next(err);
                }
                // 不存在该api项时err也是null，也返回204,也说得过去
                return res.sendStatus(204);
            });
        } else {
            // 放入回收站
            Api.findOneAndUpdate({
                name: apiName,
                belongTo: projectName
            }, {isDeleted: true}, (err, doc) => {
                if(err) {
                    return next(err);
                } 
                if(doc) {
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
    if (typeof keyword !== 'undefined' && keyword !== '') {
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
    if(keyword !== 'undefined' && keyword !== '') {
        Api.find({
            name: new RegExp(keyword, 'i'),
            belongTo: projectName
        }, constVars.apiCanRead, (err, docs) => {
            if(err) {
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