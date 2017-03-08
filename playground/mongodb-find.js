const { MongoClient, ObjectID}  = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDb server');
  }

  console.log('Connected to MongoDb server');

  // db.collection('Todos').find({
  //   _id: new ObjectID('58bd8d2747c4ef828b4deed6')
  // }).toArray().then((docs) => {
  //   console.log('Todos');
  //   console.log(JSON.stringify(docs, undefined, 2));
  // }).catch((err) => {
  //   console.log('Unable to fetch todos', err);
  // });

  db.collection('Todos').find().count().then((count) => {
    console.log(`Todos count: ${count}`)
  }).catch((err) => {

  });

  db.collection('Users').find({
    name: 'Gary'
  }).toArray().then((users) => {
      console.log('Todos');
      console.log(JSON.stringify(users, undefined, 2));
  }).catch((err) => {
      console.log('Unable to fetch users', err);
  });

  db.close();
});