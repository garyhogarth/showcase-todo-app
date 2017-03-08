const { MongoClient, ObjectID}  = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDb server');
  }

  console.log('Connected to MongoDb server');

  db.collection('Todos').insertOne({
    text: 'Something to do',
    completed: false
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert todo', err);
    }

    console.log(JSON.stringify(result.ops, undefined, 2));
  });

  // db.collection('Users').insertOne({
  //   name: 'Gary Hogarth',
  //   age: 33,
  //   location: 'Milton Keynes'
  // }).then((result) => {
  //     console.log(result.ops[0]._id.getTimestamp());
  // }).catch((err) => {
  //   console.log('Unable to insert user', err);
  // });

  db.close();
});