const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const{ ObjectID } = require('mongodb');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

let app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  const {text} = req.body;

  let todo = new Todo({
    text
  });

  todo.save().then((doc) => {
    res.status(200);
    res.send(doc);
  }).catch((e) => {
    res.status(400).send(e);
  });

});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.get('/todos/:id', (req, res) => {
  const { id } = req.params;
  
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({});
  }
  
  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send({});
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.listen(3000, () => {
  console.log('Started on port 3000');
});

module.exports = { app };