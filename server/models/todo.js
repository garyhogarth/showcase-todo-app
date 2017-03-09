const _ = require('lodash');
const mongoose = require('mongoose');

let TodoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

TodoSchema.methods.toJSON = function () {
  const todo = this;
  const todoObject = todo.toObject();

  return _.pick(todoObject,['_id', 'text', 'completed', 'completedAt','_creator']);
};

var Todo = mongoose.model('Todo', TodoSchema);

module.exports = { Todo };