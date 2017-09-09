// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

// var obj = new ObjectID();
// console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server', err);
  }
  console.log('Connected to MongoDB server');

  // db.collection('Todos').insertOne({
  //   text: 'Something more to do',
  //   completed: false
  // }, (err, res) => {
  //   if (err) {
  //     return console.log('Unabled to insert todo', err);
  //   }

  //   console.log(JSON.stringify(res.ops, undefined, 2));
  // });

  // db.collection('Users').insertOne({
  //   name: 'Fred',
  //   age: 22,
  //   location: 'Fremantle'
  // }, (err, res) => {
  //  if (err) {
  //     return console.log('Unabled to insert user', err);
  //  }
  //  console.log(JSON.stringify(res.ops[0]._id.getTimestamp(), undefined, 2));
  // });

  db.close();
});