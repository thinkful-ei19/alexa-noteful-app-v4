'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_MONGODB_URI, JWT_SECRET } = require('../config');

const User = require('../models/user');

const seedUsers = require('../db/seed/users');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Login', function() {
//   let token;
//   const username = 'exampleUser';
//   const password = 'password10';
//   const fullname = 'Example User';
//   const id = '333333333333333333333300';
//   const digest = '$2a$10$32jNGd6nmugrIgQl6ClTC.v.QRSHwMLC.XegKx7mnUolEDSaNu7y6';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return User.insertMany(seedUsers);
    // return User.create({
    //   _id: id,
    //   username,
    //   password: digest,
    //   fullname
    // });
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
    // alternatively
    //return User.remove();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('/api/login', function() {
    describe('POST', function () {
      it('Should return a valid auth token', function () {
        const { _id: id, username, fullname } = seedUsers[0];
        return chai.request(app)
          .post('/api/login')
          .send( {username, password: 'password10'} )
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a('object');
            expect(res.body.authToken).to.be.a('string');

            const payload = jwt.verify(res.body.authToken, JWT_SECRET);

            expect(payload.user).to.not.have.property('password');
            expect(payload.user).to.deep.equal({ id, username, fullname });
          });
      }); 

      it('Should reject request with no credentials', function() {
        const testUser = {};
        return chai.request(app)
          .post('/api/login')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Bad Request');
          });
      });

      it('Should reject requests with incorrect usernames', function() {
        const testUser = { 
          username: 'johnDoe',
          password: 'password10'
        };
        return chai.request(app)
          .post('/api/login')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(401);
            expect(res.body.message).to.equal('Unauthorized');
          });
      });
      it('Should reject requests with incorrect passwords', function() {
        const testUser = { 
          username: 'user0',
          password: 'incorrect'
        };
        return chai.request(app)
          .post('/api/login')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(401);
            expect(res.body.message).to.equal('Unauthorized');
          });
      });
    });
  });


});



