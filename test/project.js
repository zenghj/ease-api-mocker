process.env.NODE_ENV = 'test';
let mongoose = require("mongoose");
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);


let Project = require('../db').Project;
let User = require('../db').User;
let app = require('../app');
let routerConfig = require('../routes/config');


describe('Project', () => {
    // Before each test we empty the database
    beforeEach((done) => {
        Project.remove({}, (err) => {
            chai.request(app)
                .post(routerConfig.signup)
                .send({
                    username: 'julian',
                    password: '111111'
                });
            chai.request(app)
                .post(routerConfig.login)
                .send({
                    username: 'julian',
                    password: '111111'
                })
            done();
        });

    
    })


    // test /auth/signup
    describe('POST /api/projects/:projectName', () => {
        it('should create a project', (done) => {
         
            chai.request(app)
              .post('/api/projects/测试project的name')
              .send({
                name: '测试project的name',
                createBy: 'julian',
                updateBy: 'julian'
              })
              .end((err, res) => {
                  console.log(res.body);
                  res.should.have.status(201);
                  res.body.should.be.a('object');
                done();
              });
        });
    
    });


    // test 


});