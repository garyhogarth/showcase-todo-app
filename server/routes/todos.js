const _ = require('lodash');
const express = require('express');
const router = express.Router();

const { ObjectID } = require('mongodb');

const { Todo } = require('../models/todo');
const { authenticate } = require('../middleware/authenticate');

/**
 * POST /todos - Create a new todo
 */
router.post('/', authenticate, (req, res) => {
  const {text} = req.body;

  let todo = new Todo({
    text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }).catch((e) => {
    res.status(400).send(e);
  });

});

/**
 * GET /todos - Get all todos for current user
 */
router.get('/', authenticate, (req, res) => {
  Todo.find({_creator:req.user._id.toHexString()}).then((todos) => {
    res.send({todos});
  }).catch((e) => {
    res.status(400).send(e);
  })
});

/**
 * GET /todos/:id - Get a single users todo
 */
router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({});
  }
  
  Todo.findOne({
      _id:id,
       _creator:req.user._id.toHexString()
    }).then((todo) => {
    if (!todo) {
      return res.status(404).send({});
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

/**
 * DELETE /todos/:id - Delete a single todo
 */
router.delete('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({});
  }
  
  Todo.findOneAndRemove({
      _id:id,
       _creator:req.user._id.toHexString()
    }).then((todo) => {
    if (!todo) {
      return res.status(404).send({});
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

/**
 * PATCH /todos/:id - Update a single todo
 */
router.patch('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({});
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({
      _id: id,
      _creator:req.user._id.toHexString()
  }, {
    $set: body
  }, {
    new: true
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send({});
    }
    res.send({todo});
  }).catch((err) => {
    response.status(400).send();
  });

});

module.exports = router;