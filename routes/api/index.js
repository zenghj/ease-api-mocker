'use strict';
const express = require('express');
const router = express.Router();
const Project = require('../../db/project');
const apiCheckAuth = require('../../middlewares/checkauth').apiCheckAuth;
const errorLogger = require('../../middlewares/logger').errorLogger;

// 这里统一处理'/api/**/*'路由下的鉴权
router.use(apiCheckAuth);
// 存储的时间，更新的时间需要处理，mongo存的是UTC格式的，暂定前端输出时处理

// 创建项目
router.post('/projects/:projectName', (req, res, next) => {
    // /projects/ 不会被匹配上
    let username = req.session.username;
    let projectName = req.params.projectName;
  
    if(typeof username === 'undefined') {
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
    });
    newProject.save((err, savedProject) => {
        if(err) {
            // 触发这种返回还有可能是其他错误，但是返回给用户的是这种‘人性化欺骗-_-‘
            console.log(err);
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
            select: 'name updateBy updateAt'
        }).then((result) => {
            result.pageSize = result.limit;
            delete result.limit;
            res.send(result);
        })
        

    } else {
        // 不分页
        Project.find({}, 'name updateBy updateAt', (err, docs) => {
            if(err) {
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
    if(typeof newName === 'undefined') {
        return res.sendStatus(400);
        // 400 [POST/PUT/PATCH]：用户发出的请求有错误，服务器没有进行新建或修改数据的操作，该操作是幂等的
    }
    Project.updateOne({name: oldName}, {
        name: newName,
        updateAt: Date.now(),
        updateBy: req.session.username
     }, (err, doc) => {
        if(err) {
            return next(new Error('fail to update project name.'));
        }
        res.sendStatus(201);
    });
})

// '/api'下的错误日志
router.use(errorLogger);

router.use((err, req, res, next) => {
    return res.status(500).send({
        error: err.message || 'server error',
        status: err.status || 500
    })
});

module.exports = router;