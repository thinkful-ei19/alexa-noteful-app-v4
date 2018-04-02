'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const User = require('../models/user');


/* ========== POST/CREATE A USER ========== */
router.post('/users', (req, res, next) => {
  
  //The username and password fields are required
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if(missingField) {
    const err = new Error(`Missing ${missingField} in request body`);
    err.status = 422;
    return next(err);
  }
  
  //The fields are type string
  const stringFields = ['fullname', 'username', 'password'];
  const nonStringFields = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');
  
  if(nonStringFields) {
    const err = new Error('Incorrect field type: expected string');
    err.status = 422;
    return next(err);
  }

  //The username and password should not have leading or trailing whitespace. 
  //And the endpoint should not automatically trim the values
  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(field => req.body[field].trim() !== req.body[field]);

  if (nonTrimmedField) {
    const err = new Error('Cannot start or end with whitespace');
    err.status = 422;
    return next(err);
  }
  
  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      max: 72
    }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  if (tooSmallField) {
    const min = sizedFields[tooSmallField].min;
    const err = new Error(`Field: '${tooSmallField}' must be at least ${min} characters long`);
    err.status = 422;
    return next(err);
  }

  const tooLargeField = Object.keys(sizedFields).find(
    field => 'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooLargeField) {
    const max = sizedFields[tooLargeField].max;
    const err = new Error(`Field: '${tooLargeField}' must be at most ${max} characters long`);
    err.status = 422;
    return next(err);
  }

  // Username and password were validated as pre-trimmed
  let { username, password, fullname = '' } = req.body;
  fullname = fullname.trim();

  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        fullname
      };
      return User.create(newUser);
    })
    .then(user => {
      return res.status(201).location(`${req.originalUrl}/${user.id}`).json(user);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
}); 






module.exports = router;