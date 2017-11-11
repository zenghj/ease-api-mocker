process.env.NODE_ENV = 'test';
let app = require('../app');
let mongoose = require("mongoose");
let chai = require('chai');
let should = chai.should();
let agent = require('./0-auth').agent; // 经过授权登录了的用户。
let user = require('./0-auth').user;
let unAuthAgent = require('supertest').agent(app);
let Project = require('../db').Project;
let User = require('../db').User;
let Api = require('../db').Api;
let routerConfig = require('../routes/config');
const _ = require('underscore');
const deepCopy = require('../lib/util').deepCopy;

let cache = {
    newProjectName: 'project for test api',
    notExistedId: mongoose.Types.ObjectId(),
    projectId: undefined, // 创建的project 的 Id
    apiId: undefined, // 创建的api 的 Id
    apiName: 'test.json',
    createApiReqProps: ['reqUrl, method, canCrossDomain, reqParams, resParams, successMock, failMock'],
    createApiReqData: {
        reqUrl: 'http://127.0.0.1:3000/api/projects',
        method: 'GET',
        canCrossDomain: true,
        reqParams: [
            {
                name: 'limit',
                required: false,
                describe: 'page size',
                type: 'Number'
            }, {
                name: 'page',
                required: false,
                describe: 'page number',
                type: 'Number'
            }
        ],
        resParams: [
            {
                name: 'status',
                required: true,
                describe: '状态码',
                type: 'Number'
            }, {
                name: 'message',
                required: true,
                describe: '返回状态message',
                type: 'String'
            }, {
                name: 'docs',
                required: false,
                describe: 'project列表',
                type: 'Array'
            }, {
                name: 'docs[i]._id',
                required: true,
                describe: '项目id',
                type: 'String'
            }

        ],
        successMock: {
            "docs": [
                {
                    "_id": "59c23bde6c862125355b7eef",
                    "name": "我的第1个项目",
                    "updateBy": "julian",
                    "updateAt": "2017-09-20T09:58:54.227Z",
                    "isDeleted": false
                }
            ],
            "total": 1,
            "limit": 10,
            "page": 1,
            "pages": 1,
            "status": 200
        },
        failMock: {
            "status": 401,
            "message": "未登录"
        }
    }
};

describe('Api 相关的接口', () => {

    before('clear Project Api data', async () => {
        try {
            let project = new Project({
                name: cache.newProjectName,
                createBy: user.username
            });
            await Project.remove({});
            project = await project.save();
            cache.projectId = project._id;
            await Api.remove({});
            // console.log(project);
            // console.log(cache);
        } catch (err) {
            console.log(err);
        }
    });

    describe('创建api: POST /api/projects/:projectId/:APIName', () => {
        it('should 404 for 该项目不存在', (done) => {
            agent.post(routerConfig.api.C.replace(':projectId', cache.notExistedId).replace(':APIName', cache.apiName))
                .send(cache.createApiReqData)
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(404);
                    done();
                });
        });

        // 为嘛不能循环一下，这么多校验，测试用例咋写。。
        // cache.createApiReqProps.forEach((item) => {
        //     it(`should 400 for ${item} 为空`, (done) => {
        //         console.log(cache);
        //         agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
        //         .send(_.omit(cache.createApiReqData, item))
        //         .end((err, res) => {
        //             res.status.should.be.equal(400);
        //             done();
        //         });
        //     });
        // });
        // 'reqUrl, method, canCrossDomain, reqParams, resParams, successMock, failMock'
        // 对于这种校验超级多的接口，怎么写测试用例会方便一点呢，而不是这种复制粘贴修改
        it('should 400 for reqUrl 为空', (done) => {
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(_.omit(cache.createApiReqData, 'reqUrl'))
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });
        it('should 400 for method 为空', (done) => {
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(_.omit(cache.createApiReqData, 'method'))
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });
        it('should 400 for canCrossDomain 为空', (done) => {
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(_.omit(cache.createApiReqData, 'canCrossDomain'))
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });
        it('should 400 for reqParams 为空', (done) => {
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(_.omit(cache.createApiReqData, 'reqParams'))
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });
        it('should 400 for reqParams[0].name 为空', (done) => {
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(_.omit(cache.createApiReqData.reqParams, 'name'))
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });
        it('should 400 for reqParams[0].describe 为空', (done) => {
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(_.omit(cache.createApiReqData.reqParams, 'describe'))
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });
        it('should 400 for reqParams[0].type 为空', (done) => {
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(_.omit(cache.createApiReqData.reqParams, 'type'))
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });
        it('should 400 for reqParams[0].required 为空', (done) => {
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(_.omit(cache.createApiReqData.reqParams, 'required'))
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });
        it('should 400 for resParams 为空', (done) => {
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(_.omit(cache.createApiReqData, 'resParams'))
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });
        it('should 400 for successMock 为空', (done) => {
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(_.omit(cache.createApiReqData, 'successMock'))
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });
        it('should 400 for failMock 为空', (done) => {
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(_.omit(cache.createApiReqData, 'failMock'))
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });

        it('should 400 for reqUrl 格式不正确', (done) => {
            let notValidData = deepCopy(cache.createApiReqData);
            notValidData.reqUrl = '/test-reqUrl-format.json';
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(notValidData)
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });

        it('should 400 for method 不合法', (done) => {
            let notValidData = deepCopy(cache.createApiReqData);
            notValidData.method = 'get';
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(notValidData)
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });

        it('should 400 for canCrossDomain 不为布尔值', (done) => {
            let notValidData = deepCopy(cache.createApiReqData);
            notValidData.canCrossDomain = 'test';
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(notValidData)
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });
        it('should 400 for reqParams[0].required 不为布尔值', (done) => {
            let notValidData = deepCopy(cache.createApiReqData);
            notValidData.reqParams[0].required = 1;
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(notValidData)
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });

        it('should 201 for 创建api成功', (done) => {
            agent.post(routerConfig.api.C.replace(':projectId', cache.projectId).replace(':APIName', cache.apiName))
                .send(cache.createApiReqData)
                .set('Content-Type', 'application/json;charset=UTF-8')
                .end((err, res) => {
                    res.status.should.be.equal(201);
                    res.body.result._id.should.not.be.null;
                    cache.apiId = res.body.result._id;
                    done();
                });
        });

    });

    describe('读取api详情: GET /api/projects/:projectId/:apiId', () => {

        it('should 404 for not exist project id', (done) => {
            agent.get(routerConfig.api.R.replace(':projectId', cache.notExistedId).replace(':apiId', cache.apiId))
                .end((err, res) => {
                    res.status.should.be.equal(404);
                    done();
                });
        });

        it('should be 200 to get api detail', (done) => {
            agent.get(routerConfig.api.R.replace(':projectId', cache.projectId).replace(':apiId', cache.apiId))
                .end((err, res) => {
                    res.status.should.be.equal(200);
                    res.body.result.should.not.be.null;
                    done();
                });
        });
    });


    describe('更新api: PUT /api/projects/:projectId/:apiId', () => {

        it('should 404 for not exist project id', (done) => {
            agent.get(routerConfig.api.U.replace(':projectId', cache.notExistedId).replace(':apiId', cache.apiId))
                .end((err, res) => {
                    res.status.should.be.equal(404);
                    done();
                });
        });

        it('should be 201 to update api detail', (done) => {
            let updateApiData = deepCopy(cache.createApiReqData);
            updateApiData.canCrossDomain = false;
            agent.put(routerConfig.api.U.replace(':projectId', cache.projectId).replace(':apiId', cache.apiId))
                .send(updateApiData)
                .end((err, res) => {
                    res.status.should.be.equal(201);
                    // res.body.result.canCrossDomain.should.be.equal(true);
                    done();
                });
        });
    });


    describe('将api移入回收站: PUT /api/projects/:projectId/:apiId', () => {
        it("should 404 for projectId's apiId 不存在", (done) => {
            agent.delete(routerConfig.api.D.replace(':projectId', cache.notExistedId).replace(':apiId', cache.apiId))
                .end((err, res) => {
                    res.status.should.be.equal(404);
                    done();
                });
        });

        it("should 201 移入回收站成功", (done) => {
            agent.delete(routerConfig.api.D.replace(':projectId', cache.projectId).replace(':apiId', cache.apiId))
                .end((err, res) => {
                    res.status.should.be.equal(201);
                    done();
                });
        });

        it("should 404 移出回收站失败 for  projectId's apiId 不存在", (done) => {
            agent.patch(routerConfig.api.U.replace(':projectId', cache.notExistedId).replace(':apiId', cache.apiId))
                .send({ isRecover: 'true' })
                .end((err, res) => {
                    res.status.should.be.equal(404);
                    done();
                });
        });

        it("should 201 移出回收站成功", (done) => {
            agent.patch(routerConfig.api.U.replace(':projectId', cache.projectId).replace(':apiId', cache.apiId))
                .send({ isRecover: 'true' })
                .end((err, res) => {
                    res.status.should.be.equal(201);
                    res.body.result.isDeleted.should.be.equal(false);
                    done();
                });
        });

        it("should 404 彻底删除失败 for  projectId's apiId 不存在", (done) => {
            agent.delete(routerConfig.api.D.replace(':projectId', cache.notExistedId).replace(':apiId', cache.apiId))
                .end((err, res) => {
                    res.status.should.be.equal(404);
                    done();
                });
        });

        it("should 204 彻底删除成功", (done) => {
            agent.delete(routerConfig.api.D.replace(':projectId', cache.projectId).replace(':apiId', cache.apiId))
                .send({isForceDelete: 'true'})
                .end((err, res) => {
                    res.status.should.be.equal(204);
                    done();
                });
        });

    });
    describe('读取当前项目apis：GET /api/:projectId/apis', () => {

        before('create 10 api in cache.projectid', () => {
            let api = deepCopy(cache.createApiReqData);
            api.projectId = cache.projectId;
            api.isDeleted = false;
            for(let i = 0; i < 10; i++) {
                api.APIName =  `api-name-${i}`;
                let apiDoc = new Api(api);
                apiDoc.save((err, doc) => {
                    if(err) console.log(err);
                });
            }
        });

        it('should 200 分页读取api列表成功 GET /api/:projectId/apis', (done) => {
            agent.get(routerConfig.api.allInThisProj.replace(':projectId', cache.projectId))
                .end((err, res) => {
                    // console.log(res);
                    console.log(res.body.result.docs.length)
                    res.status.should.be.equal(200);
                    res.body.result.should.not.be.null;
                    res.body.result.docs.length.should.be.equal(10);
                    done();
                });
        });

        it('should 400 keyword不能为空 GET /api/search/:projectId/apis', (done) => {
            agent.get(routerConfig.api.search.replace(':projectId', cache.projectId))
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });

        it('should 200 关键词搜索成功 GET /api/search/:projectId/apis', (done) => {
            agent.get(routerConfig.api.search.replace(':projectId', cache.projectId))
                .query({keyword: 'api-name-1'}) //注意不要用send()
                .end((err, res) => {
                    // console.log(res);
                    res.status.should.be.equal(200);
                    res.body.result.docs.length.should.be.equal(1);
                    done();
                });
        });
    });


});