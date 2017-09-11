const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// var id = '59b666438976f3283066c0b2';

// if (!ObjectID.isValid(id)) {
//   console.log('ID not valid');
// }
// else {
//   Todo.find({
//     _id: id
//   }).then((docs) => {
//     console.log('Todos', docs);
//   });

//   Todo.findOne({
//     _id: id
//   }).then((doc) => {
//     if (!doc) { 
//       return console.log('Todo ID not found'); 
//     }
//     console.log('Todo', doc);
//   });

//   Todo.findById(id).then((doc) => {
//     if (!doc) { 
//       return console.log('Todo ID not found'); 
//     }
//     console.log('Todo by Id', doc);
//   }).catch((err) => {
//     console.log(err);
//   });
// }

var id = '59b4dff1f93b2f436c4260a3';

User.findById(id).then((doc) => {
  if (!doc) {
    return console.log('User not found');
  }
  console.log('User', doc);
}).catch((err) => {
  console.log(err);
});
