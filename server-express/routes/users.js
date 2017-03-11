const _ = require('lodash');
const express = require('express');
const router = express.Router();

const { ObjectID } = require('mongodb');

const { User } = require('../models/user');
const { authenticate } = require('../middleware/authenticate');

router.post('/', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  let user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });

});

router.get('/me', authenticate, (req, res) => {
  res.send(req.user);
});

router.post('/login', (req, res) => {
  const { email, password } = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(email,password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    })
  }).catch((e) => {
    res.status(400).send(e);
  });

});

router.delete('/me/logout', authenticate, (req, res) => {
    res.redirect('/me/token');
});

router.delete('/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.send();
  }).catch((e) => {
    res.status(400).send(e);
  });
});

module.exports = router;