const { MongoClient, ObjectID}  = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDb server');
  }

  console.log('Connected to MongoDb server');

  // db.collection('Todos').findOneAndUpdate({
  //   _id: new ObjectID('58bec15405c249aeb160a359')
  // }, {
  //   $set: {
  //     completed: true
  //   }
  // }, {
  //   returnOriginal: false
  // }).then((result) => {
  //   console.log(JSON.stringify(result.value, undefined, 2));
  // });

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('58bd9ccc379fb399f0d4a3ae')
  },{
    $set: {name: 'Gary'},
    $inc: {age: 1}
  }, {
    returnOriginal: false
  }).then((result) => {
    console.log(result);
  });

  db.close();
});