//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
let mongoose = require("mongoose");
let chai = require('chai');
let supertest = require('supertest');
let should = chai.should();
let expect = chai.expect;

let User = require('../db').User;
let app = require('../app');
let routerConfig = require('../routes/config');
let julian = {
    username: 'julian',
    password: '111111'
    // ,createdAt: Date.now
};
let agent = supertest.agent(app);
describe('User', () => {
    // Before each test we empty the database

    before('清空数据库再重新创建新user: julian', async function() {
        await User.remove({});
    });
  
    // test /auth/signup
    describe('POST /auth/signup', () => {
        it('should create a user with fields: username、password, 302 redirect', (done) => {
            agent.post(routerConfig.signup)
              .send(julian)
              .end((err, res) => {
                //   res.should.have.status(302);
                res.status.should.be.equal(302);
                // expect(res.statusCode).to.equal(302);
                done();
              });
        });
    
    });
    

    describe('POST /auth/login', () => {
        it('should 302 redirect, because last request is /auth/signup', (done) => {
            agent.post(routerConfig.login)
              .send(julian)
              .end((err, res) => {
                res.status.should.be.equal(302);
                //   res.should.have.status(302);
                //   expect('Location', '/');
                //   res.body.should.be.a('object');
                done();
              });
        });
    
    });


    // test 


});

module.exports = {
    agent: agent,
    user: julian
};

