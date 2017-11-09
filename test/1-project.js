/**
 * 发现有的时候更改了测试文件，立刻执行npm run test不起作用，貌似执行的不是新修改了的版本,很奇怪
 */

process.env.NODE_ENV = 'test';
let app = require('../app');
let mongoose = require("mongoose");
let chai = require('chai');
let should = chai.should();
let agent = require('./0-auth').agent; // 经过授权登录了的用户。
let unAuthAgent = require('supertest').agent(app);
let Project = require('../db').Project;
let User = require('../db').User;
let routerConfig = require('../routes/config');

let cache = {
    newProjectName: 'my-proj的方法ect-name-Updated',
    notExistedId: mongoose.Types.ObjectId(),
    projectId: undefined
};

// root level hook function will run before any case
// before('clear project data', async function () {
//     await Project.remove({});
// });

describe('Project 相关的接口', () => {

    before('clear project data', async function () {
        await Project.remove({});
    });

    describe('创建项目：POST /api/projects/:projectName', () => {
        it('should 401 for 未登录', (done) => {
            unAuthAgent.post('/api/projects/测试project的name')
                .send({})
                .end((err, res) => {
                    res.status.should.be.equal(401);
                    done(); 
                });
        });


        it('should create a project', (done) => {
            agent.post('/api/projects/测试project的name')
                .send({})
                .end((err, res) => {
                    res.status.should.be.equal(201);
                    cache.projectId = res.body.result._id;
                    done(); // must call done() when end
                });
        });


        it('should 400, 该项目已存在', (done) => {
            agent.post('/api/projects/测试project的name')
                .send({})
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });

    });

    describe('分页获取所有项目列表：GET /api/projects', () => {
        it('should get projects array', (done) => {
            agent.get(routerConfig.project.R)
                .send({})
                .end((err, res) => {
                    let result = res.body;
                    let docs = result.docs;
                    let allIsNotDeleted = docs.every((doc) => {
                        return doc.isDeleted === false;
                    });
                    res.status.should.be.equal(200);
                    docs.should.be.an('array');
                    docs.length.should.not.be.above(10);
                    allIsNotDeleted.should.be.equal(true);
                    cache.projectId = docs[0]._id;
                    done();
                });
        });

    });

    describe('更改项目名称：PATCH /api/projects/:projectId', () => {
        it('should update project name', (done) => {

            agent.patch(routerConfig.project.U.replace(':projectId', cache.projectId))
                .send({ newProjectName: cache.newProjectName })
                .end((err, res) => {
                    // console.log(res);
                    res.body.should.be.an('object');
                    res.status.should.be.equal(201);
                    done();
                });
        });

        it('should 400 without newProjectName param', (done) => {
            agent.patch(routerConfig.project.U.replace(':projectId', cache.projectId))
                .send({})
                .end((err, res) => {
                    // console.log(res)
                    res.body.should.be.an('object');
                    res.status.should.be.equal(400);
                    done();
                });
        });

        it('should 404 for not existed project id', (done) => {
            agent.patch(routerConfig.project.U.replace(':projectId', cache.notExistedId))
                .send({ newProjectName: cache.newProjectName })
                .end((err, res) => {
                    // console.log(res)
                    res.body.should.be.an('object');
                    res.status.should.be.equal(404);
                    done();
                });
        });


    });

    describe('根据项目名称关键词搜索项目项目 GET /api/search/projects', () => {
        it('should 200 return one project data', (done) => {
            agent.get(routerConfig.project.search)
                .query({ keyword: cache.newProjectName.slice(0, cache.newProjectName.length / 2) })
                .end((err, res) => {
                    // console.log(res.body);
                    res.status.should.be.equal(200);
                    res.body.should.be.an('object');
                    res.body.result.docs.length.should.be.equal(1);
                    done();
                });
        });

        it('should 400 keyword不能为空', (done) => {
            agent.get(routerConfig.project.search)
                .send({})
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });



    });

    describe('从回收站恢复项目 PUT /api/projects/:projectId', () => {
        it('恢复项目 should 404 for not existed project id', (done) => {
            agent.put(routerConfig.project.U.replace(':projectId', cache.notExistedId))
                .send({ isRecover: 'true' })
                .end((err, res) => {
                    res.status.should.be.equal(404);
                    done();
                });
        });

        it('恢复项目 should 400 for 该项目不在回收站', (done) => {
            agent.put(routerConfig.project.U.replace(':projectId', cache.projectId))
                .send({ isRecover: 'true' })
                .end((err, res) => {
                    res.status.should.be.equal(400);
                    done();
                });
        });

        it('先移动到回收站 再恢复项目 should 201', (done) => {
            agent.delete(routerConfig.project.D.replace(':projectId', cache.projectId))
                .end((err, res) => {
                    res.status.should.be.equal(201);

                    agent.put(routerConfig.project.U.replace(':projectId', cache.projectId))
                    .send({isRecover: 'true'})
                    .end((err, res) => {
                        res.status.should.be.equal(201);
                        res.body.result.isDeleted.should.be.equal(false);
                        done();
                    });

                });
            

        });

    });

    describe('删除项目 DELETE /api/projects/:projectId', () => {
        it('should 404 for not existed project id', (done) => {
            agent.delete(routerConfig.project.D.replace(':projectId', cache.notExistedId))
                .end((err, res) => {
                    res.status.should.be.equal(404);
                    res.body.should.be.an('object');
                    done();
                });
        });


        it('should 201 for 移动到回收站', (done) => {
            agent.delete(routerConfig.project.D.replace(':projectId', cache.projectId))
                .end((err, res) => {
                    res.status.should.be.equal(201);
                    res.body.should.be.an('object');
                    res.body.message.should.be.equal('移入回收站成功');
                    done();
                });
        });

        it('should 404 for 强制完全删除 not existed project', (done) => {
            agent.delete(routerConfig.project.D.replace(':projectId', cache.notExistedId))
                .end((err, res) => {
                    res.status.should.be.equal(404);
                    res.body.should.be.an('object');
                    done();
                });
        });

        it('should 204 for 强制完全删除', (done) => {
            agent.delete(routerConfig.project.D.replace(':projectId', cache.projectId))
                .send({ isForceDelete: 'true' })
                .end((err, res) => {
                    res.status.should.be.equal(204);
                    done();
                });
        });
    });

});