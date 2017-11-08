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
let routerConfig = require('../routes/config');

let cache = {
    newProjectName: 'my-proj的方法ect-name-Updated',
    notExistedId: mongoose.Types.ObjectId(),
    projectId: undefined,
    apiName: 'test.json',
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

before('clear project data', async () => {
    try {
        let project = new Project({
            name: cache.newProjectName,
            createBy: user.username
        });
        await Project.remove({});
        await project.save();
    } catch(err) {
        console.log(err);
    }
    
});

describe('Api 相关的接口', () => {
    
    describe('创建api: POST /api/projects/:projectId/:APIName', () => {
        it('should 404 for 该项目不存在', (done) => {
            agent.post(routerConfig.api.C.replace(':projectId', cache.notExistedId).replace('：APIName', cache.apiName))
                .send(cache.createApiReqData)
                .end((err, res) => {
                    res.status.should.be.equal(404);
                    done();
                })
        })
    });
    
    // describe('读取当前项目apis：GET /api/projects/:projectId/apis', () => {

    // });
});