'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const User = require('../models/user');


/* ========== POST/CREATE A USER ========== */
router.post('/users', (req, res, next) => {
  const { fullname, username, password } = req.body;
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