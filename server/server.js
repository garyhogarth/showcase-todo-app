// Third party modules
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Config
require('./config/config');
const port = process.env.PORT;

// DB Setup
const { mongoose } = require('./db/mongoose');

// Routes/Controllers
const todos = require('./routes/todos');
const users = require('./routes/users');
let app = express();

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use('/todos', todos);
app.use('/users', users);

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };