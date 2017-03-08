const { MongoClient, ObjectID}  = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDb server');
  }

  console.log('Connected to MongoDb server');

  // // deleteMany
  // db.collection('Todos').deleteMany({text:'Eat lunch'}).then((result) => {
  //   console.log(result);
  // }).catch((err) => {
  //
  // });

  // deleteOne
  // db.collection('Todos').deleteOne({text:'Eat lunch'}).then((result) => {
  //   console.log(result);
  // }).catch((err) => {
  //
  // // });
  //
  // // findOne and delete
  // db.collection('Todos').findOneAndDelete({completed:false}).then((result) => {
  //   console.log(result);
  // }).catch((err) => {
  //
  // });


  // db.collection('Users').deleteMany({name:'Gary'}).then((result) => {
  //   console.log(result);
  // }).catch((err) => {
  //
  // });

  // findOne and delete
  db.collection('Users').findOneAndDelete({_id:new ObjectID('58bd9c6b8437b999db8ca150')}).then((result) => {
    console.log(result);
  }).catch((err) => {

  });

  db.close();
});