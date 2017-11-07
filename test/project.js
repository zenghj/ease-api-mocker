/**
 * 发现有的时候更改了测试文件，立刻执行npm run test不起作用，貌似执行的不是新修改了的版本
 */

process.env.NODE_ENV = 'test';
let mongoose = require("mongoose");
let chai = require('chai');
let should = chai.should();
let agent = require('./auth').agent; // 经过授权登录了的用户。


let Project = require('../db').Project;
let User = require('../db').User;
let app = require('../app');
let routerConfig = require('../routes/config');

let cache = {
    newProjectName: 'my-proj的方法ect-name-Updated'
};

before('clear project data', async function () {
    await Project.remove({});
})

describe('Project', () => {

    describe('创建项目：POST /api/projects/:projectName', () => {
        it('should create a project', (done) => {
            agent.post('/api/projects/测试project的name')
                .send({})
                .end((err, res) => {
                    res.status.should.be.equal(201);
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
                .send({newProjectName: cache.newProjectName})
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
            let notExistedId = mongoose.Types.ObjectId();
            // console.log(notExistedId);
            agent.patch(routerConfig.project.U.replace(':projectId', notExistedId))
                .send({newProjectName: cache.newProjectName})
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
                .query({keyword: cache.newProjectName.slice(0, cache.newProjectName.length/2)})
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
    // describe('删除项目 移动到回收站 DELETE /projects/:projectId', () => {
    //     it('should 404 for not existed project id', (done) => {

    //     });
    // })


});