'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const User = require('../models/user');


/* ========== POST/CREATE A USER ========== */
router.post('/users', (req, res) => {
  console.log('making post request to /api/users');

  const { fullname, username, password } = req.body;
  
  const newUser = {fullname, username, password};
  User.create(newUser)
    .then(user => {
      return res.status(201).location(`${req.originalUrl}/${user.id}`).json(user);
    });
});





module.exports = router;