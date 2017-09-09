const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server', err);
  }
  console.log('Connected to MongoDB server');

  // Search for Todos by ObjectID  
  db.collection('Todos').find({
      _id: new ObjectID('59b28fe1d607e72e1c327e57')
    }).toArray()
    .then((docs) => {
      console.log('Todos');
      console.log(JSON.stringify(docs, undefined, 2));
    })
    .catch((err) => {
      console.log('Unable to fetch todos', err);
    });

  // Count all Todo documents
  // db.collection('Todos').find({}).count()
  //   .then((count) => {
  //     console.log(`Todos count: ${count}`);
  //   })
  //   .catch((err) => {
  //     console.log('Unable to fetch todos', err);
  //   });

  // Search for all Users with a location of 'Perth'  
  db.collection('Users').find({
      location: 'Perth'
    }).toArray()
    .then((docs) => {
      console.log('Users', );
      console.log(JSON.stringify(docs, undefined, 2));
    })
    .catch((err) => {
      console.log('Unable to fetch users', err);
    });

  // db.close();
});