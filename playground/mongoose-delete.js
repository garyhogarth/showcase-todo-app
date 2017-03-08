const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

// Todo.remove({}).then(result => {
//     console.log(result);
// });

// Todo.findOneAndRemove().then(result => {
//     console.log(result);
// });

Todo.findByIdAndRemove('58c011bca3038a5ccce2ffdf').then((todo) => {
    console.log(todo);
})
