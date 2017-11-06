//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
let mongoose = require("mongoose");
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);

let User = require('../db').User;
let app = require('../app');
let routerConfig = require('../routes/config');

describe('User', () => {
    // Before each test we empty the database
    beforeEach((done) => {
        User.remove({}, (err) => {
            done();
        })
    })


    // test /auth/signup
    describe('POST /auth/signup', () => {
        it('should create a user with fields: username、password', (done) => {
            let user = {
                username: 'julian',
                password: '111111'
            };
            chai.request(app)
              .post(routerConfig.signup)
              .send(user)
              .end((err, res) => {
                  console.log(res.body);
                  res.should.have.status(200);
                
                  res.body.should.be.a('object');
                done();
              });
        });
    
    });


    // test 


});

