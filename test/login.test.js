'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_MONGODB_URI } = require('../config');

const User = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Users', function() {
  let token;
  const username = 'exampleUser';
  const password = 'examplePass';
  const fullname = 'Example User';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connect.db.dropDatabase());
  });

  beforeEach(function () {
    return User.create({
      username,
      password,
      fullname
    });
  });

  after(function () {
    return mongoose.connection.db.dropDatabase();
    // alternatively
    // return User.remove();
  });

  after(function () {
    return mongoose.disconnect();
  });



});



