'use strict';

const express = require('express');
const passport = require('passport');

const router = express.Router();

const options = {session: false, failWithError: true};

const localAuth = passport.authenticate('local', options);

// ===== Protected endpoint ===== //
router.post('/login', localAuth, function (req, res) {
  console.log('making a post request to /api/login');
  return res.json(req.user);
});


module.exports = router;

