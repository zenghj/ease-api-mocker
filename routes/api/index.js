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
    apiCanUpdate: 'projectName APIName reqUrl method canCrossDomain reqParams resParams successMock failMock isDeleted',
    apiCanRead: 'id projectName APIName reqUrl method canCrossDomain reqParams resParams successMock failMock createAt createBy updateAt updateBy version isDeleted',
    duplicateCode: 11000,
    httpMethods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH']
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
            res.status(200).json({
                status: 200,
                message: '获取项目列表成功',
                result: result
            });
        }).catch((err) => {
            return next(err);
        });
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

    // 通过postman发送过来会自动转成string,
    // $.ajax({method: 'DELETE', url: '/api/projects/5a01be45ea6b526e5696b196', data: {isForceDelete: true}})也会被转成string
    // 但是测试代码却不会转...，所以接口统一规定isForceDelete为string类型吧
    // 有时间去看一下bodyParse中间件文档吧
    if (isForceDelete === 'true') { 
        // 完全删除
        Project.findByIdAndRemove(projectId, (err, doc) => {
            if (err) {
                return next(err);
            }
            if (doc) {
                Api.find({ projectId: projectId })
                    .remove((err, writeOpResult) => {
                        if (err) {
                            return next(err);
                        }
                        res.sendStatus(204);
                    });
            } else {
                res.status(404).json({
                    status: '404',
                    message: '该项目不存在'
                });
            }
        });
    } else {
        // 移入回收站
        Project.findByIdAndUpdate(projectId, {
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
                    // 发现204时响应会强制不带数据，都是No Content,所以还是用201吧
                    return res.status(201).json({
                        status: 201,
                        message: '移入回收站成功'
                    });
                })
            } else {
                return res.status(404).json({
                    status: 404,
                    message: '该项目不存在'
                });
            }
        })
    }

});

// 将项目移出回收站,回恢复项目
router.put('/projects/:projectId', (req, res, next) => {
    let isRecover = req.body.isRecover;
    let projectId = req.params.projectId;

    if(isRecover === 'true') {
        Project.findById(projectId, (err, doc) => {
            if(err) {
                return next(err);
            }
            if(doc) {
                if(doc.isDeleted === true) {
                    doc.isDeleted = false;
                    doc.save((err, savedDoc)=> {
                        if(err) {
                            return next(err);
                        }
                        return res.status(201).json({
                            status: 201,
                            message: '项目恢复成功',
                            result: savedDoc
                        });
                    })
                } else {
                    return res.status(400).json({
                        status: 400,
                        message: '该项目不在回收站'
                    });
                }
                
            } else {
                return res.status(404).json({
                    status: 404,
                    message: '该项目不存在'
                });
            }
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
    }, { page, limit }, (err, results) => {
        if (err) {
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




function checkApiReqData(req, res, next) {
    //校验基本数据格式
    req.checkBody({
        reqUrl: {
            notEmpty: {
                errorMessage: 'reqUrl接口路径不能为空'
            }
            // , isURL: {
            //     errorMessage: 'reqUrl接口路径不是合法的url格式'
            // }
        }
        , method: {
            isHttpMethod: {
                errorMessage: 'method http请求方式不合法（注意method字段应为大写字母）'
            }
        }
        , successMock: {
            notEmpty: {
                errorMessage: '返回成功数据successMock不能为空'
            }
        }
        // , failMock: {
        //     notEmpty: {
        //         errorMessage: '返回失败数据failMock不能为空'
        //     }
        // }
        // , canCrossDomain: {
        //     isBoolean: {
        //         errorMessage: '是否能跨域canCrossDomain不能为空，且为布尔值'
        //     }
        // }
    });
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({
            status: 400,
            message: errors[0].msg
        })
    }

    isReqResParamsValid(req, res, next);

}

/**
 * reqParams,resParams 字段比较复杂，单独校验
 */
function isReqResParamsValid(req, res, next) {
    let {reqParams, resParams} = req.body;
    let params = {reqParams, resParams};

    try {
        // for (let key in params) {
        //     let fields = params[key]
        //     if(!fields) {
        //         return res.status(400).json({
        //             status: 400,
        //             message: `${key}不为空`
        //         });
        //     }
        //     for(let i = 0; i < fields.length; i++) {
        //         let field = fields[i];
        //         let stringFields = ['name', 'describe', 'type'];

        //         if(!_.isBoolean(field.required)) {
        //             return res.status(400).json({
        //                 status: 400,
        //                 message: `${key}[${i}]中required字段应该为布尔值`
        //             });
        //         }
                
        //         for(let j = 0; j < stringFields.length; j++) {
        //             let stringField = field[stringFields[j]];
        //             if(!_.isString(stringField) || stringField === '') {
        //                 return res.status(400).json({
        //                     status: 400,
        //                     message: `${key}[${i}]中${stringFields[j]}字段应该为字符串且不为空`
        //                 });
        //             }
        //         }
        //     }
        // } 

        next();
    } catch(err) {
        next(err);
    }
}
/**
 * Request Headers
 * Content-Type:application/json; charset=utf-8 
 * 通过设置这个头部，然后前端把整个data数据JSON.stringify处理之后传过来，
 * body-parser会将其解析为json，然后number,boolean就不会变成字符串形式的了
 * 
 * $.ajax默认设置的Content-Type为application/x-www-form-urlencoded，这种会导致number,boolean会变成字符串形式，nest array，object也需要单独JSON.stringify处理，否则会出问题
 * 既然数据库使用的mongoDB，要不要统一规定前端直接全局对所求请求设置成application/json，就不会存在number,boolean会变成字符串形式的问题了???
 * 
 * method 请求方式 @string 校验http支持的method
 * reqUrl 请求路径 @string 校验url格式 
 * canCrossDomain 是否能跨域 @boolean
 * 
 * // 请求参数 @array
 * reqParams = [
 *      {
 *          name: @string, // 参数名称 
 *          required: @boolean, // 是否必填 // 非必填是否需要添加字段标示默认值呢
 *          describe: @string   // 参数说明
 *          type: @string // 参数类型
 *      }
 * ]
 * resParams = [] // 返回参数 @array 内部结构同reqParams  // 如果一个字段是一个对象，对象内部的结构怎么描述，直接通过`.`连接来说明吧
 * successMock @ required
 * failMock @ required
 * 
 * todo: 可以搞个开关控制mock数据吐success,或fail
 */
// 创建api
router.post('/projects/:projectId/:APIName', checkApiReqData, (req, res, next) => {
    // 创建 api item
    let { projectId, APIName } = req.params;
    let { method, reqUrl, canCrossDomain, reqParams, resParams, successMock, failMock } = req.body;
    let sessionUserName = req.session.username;
    let api = {projectId, APIName, reqUrl, method, canCrossDomain, reqParams, resParams, successMock, failMock, 
        createBy: sessionUserName, updateBy: sessionUserName
    };

    Project.findById(projectId).exec((err, project) => {
        if (err) return next(err);
        if (!project) {
            return res.status(404).send({
                status: 404,
                message: `id为 ${projectId} 的项目不存在`
            });
        }

        Api.findOne({projectId, APIName}, (err, doc) => {
            if (err) return next(err);

            if (doc) {
                return res.status(400).send({
                    status: 400,
                    message: `该项目下或回收站中名为“${APIName}”的接口已存在` // 后续可以给个参数，直接可以挤掉回收站中的接口
                });
            }
            let newApi = new Api(api);
            newApi.save((err, doc) => {
                if (err) return next(err);

                return res.status(201).json({
                    status: 201,
                    message: '创建成功',
                    result: doc
                });
            });
        });
    })
});


router.route('/projects/:projectId/:apiId')
    .put(checkApiReqData, (req, res, next) => {
        // 更新api数据
        let { projectId, apiId } = req.params;
        let update = {};
        let forbidUpdateProps = [];
        Object.keys(req.body).forEach((key) => {
            if (constVars.apiCanUpdate.indexOf(key) >= 0) {
                // 防止不允许用户更新的字段被更新
                update[key] = req.body[key];
            } else {
                forbidUpdateProps.push(key);
            }
        });

        // Api.findOne({
        //     projectId,
        //     _id: apiId
        // }).exec((err, doc) => {
        //     if(err) return next(err);

        //     if(doc) {
        //         doc = _.extend(doc, update);
        //         doc.save((err, doc) => {
        //             if(err) return next(err);
        //             let result = _.pick(doc, constVars.apiCanUpdate.split(' '));
        //             return res.status(201).json({
        //                 status: 201,
        //                 message: '更新成功'
        //                 ,result: result // 如果觉得这个回写数据量大可以不要这个
        //             });
        //         });
        //     } else {
        //         return res.status(404).send({
        //             status: 404,
        //             message: `id为${projectId} 的项目下不存在id为 ${apiId}的api`
        //         });
        //     }

        // });

        // 相比上面的写法，findOneAndUpdate回调中doc得到的不是更新后的数据，很可能是更新前的错误数据，不能直接返回给前端
        Api.findOneAndUpdate({
            projectId,
            _id: apiId
        }, update, (err, doc) => {
            if (err) {
                return next(err);
            }
            if (doc) {
                // console.log(doc);
                let successMsg;
                if(forbidUpdateProps.length > 0) {
                    successMsg = '更新成功, 但是 ' + forbidUpdateProps.join(' ') + ' 是禁止更新的'
                }
                return res.status(201).send({
                    status: 201,
                    message: successMsg || '更新成功'
                });
            }
            return res.status(404).send({
                status: 404,
                message: `id为${projectId} 的项目下不存在id为 ${apiId}的api`
            });
        });

    })
    .get((req, res, next) => {
        // 获取api详细内容
        let { projectId, apiId } = req.params;
        Api.findOne({
            projectId,
            _id: apiId
        }, constVars.apiCanRead).exec((err, api) => {
            if (err) {
                return next(err);
            }
            if (api) {
                return res.send({
                    status: 200,
                    result: api,
                    message: '获取成功'
                });
            }
            return res.status(404).send({
                status: 404,
                message: `id为${projectId}的项目下不存在id为 ${apiId} 的接口`
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
                _id: apiId
            }, (err, doc) => {
                if (err) {
                    return next(err);
                }
                if (doc) {
                    Api.remove({
                        projectId,
                        _id: apiId
                    }, (err) => {
                        if (err) {
                            return next(err);
                        }
                        return res.sendStatus(204); // 204: [DELETE]：用户删除数据成功。
                    });
                } else {
                    return res.status(404).send({
                        status: 404,
                        message: `id为${projectId}的项目下不存在id为 ${apiId} 的接口`
                    });
                }

                
            });
        } else {
            // 放入回收站
            Api.findOneAndUpdate({
                projectId: projectId,
                _id: apiId
            }, { isDeleted: true }, (err, doc) => {
                if (err) {
                    return next(err);
                }
                if (doc) {
                    return res.status(201).json({
                        status: 201,
                        message: '移入回收站成功'
                    });
                }
                return res.status(404).send({
                    status: 404,
                    message: `id为${projectId}的项目下不存在id为 ${apiId} 的接口`
                })
            });
        }

    })
    .patch((req, res, next) => {
        let { projectId, apiId } = req.params;
        let isRecover = req.body.isRecover;
        if(isRecover === 'true') {
            Api.findOne({projectId, _id: apiId}).exec((err, doc) => {
                if(err) return next(err);
                if(doc) {
                    doc.isDeleted = false;
                    doc.save((err, doc) => {
                        if(err) return next(err);
                        return res.status(201).json({
                            status: 201,
                            message: '移出回收站成功',
                            result: doc
                        });
                    });
                } else {
                    return res.status(404).json({
                        status: 404,
                        message: `id为${projectId} 的项目下不存在id为 ${apiId}的api`
                    });
                }
            });
        }
    });



// api搜索
// 暂未排除已经删除到回收站的结果
router.get('/search/:projectId/apis', (req, res, next) => {
    let projectId = req.params.projectId;
    let {keyword = '', limit = 10, page = 1} = req.query;
    if(keyword === '') {
        return res.status(400).json({
            status: 400,
            message: 'keyword不能为空'
        });
    }
    Api.paginate({
        APIName: new RegExp(keyword, 'i'),
        projectId
        // ,select: constVars.apiCanRead
    }, {
        page,
        limit
    }, (err, result) => {
        if (err) return next(err);
        return res.send({
            status: 200,
            message: '获取成功',
            keyword: keyword,
            result: result
        });
    });
});

// 分页读取当前项目apis

/**
 * limit @number page size, default 10 
 * page @number page number
 */
router.get('/:projectId/apis', (req, res, next) => {
    let projectId = req.params.projectId;
    let limit = Number.parseInt(req.query.limit, 10) || 10;
    let page = Number.parseInt(req.query.page, 10) || 1;

    //分页获取
    Api.paginate({
        isDeleted: false,
        projectId: projectId
    }, {    
            page,
            limit,
            select: constVars.apiCanRead
        }, (err, result) => {
            if(err) return next(err);
            res.send({
                status: 200,
                message: '获取api成功',
                result: result
            });

        });
});

router.get('/user/baseInfo.json', function(req, res) {
    const user = req.user;
    res.send(_.pick(user, 'avatar', '_id', 'username'));
});

// '/api'下的错误日志
router.use(errorLogger);

router.use((err, req, res, next) => {
    //只处理500未知错误
    return res.status(500).send({
        // error: err,
        status: 500,
        message: err.message || '未知服务器错误'
    })
});

module.exports = router;