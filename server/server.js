require('./config/config.js');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

const port = process.env.PORT;
var app = express();

app.use(bodyParser.json());

/*-----------------------------------------------------------------------------
 ToDos
-----------------------------------------------------------------------------*/

// Create new Todo record
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  todo.save().then((doc) => {
    res.send(doc);
  }).catch((err) => {
    res.status(400).send(err);
  });
});


// Return all Todo records for current loged in user
app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos});
  }).catch((err) => {
    res.status(400).send(err);
  });
});

// Return one Todo record
app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Not a valid ID');
  }
  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((err) => {
    res.status(400).send(err);
  });
});

// Delete a Todo record
app.delete('/todos/:id',  authenticate, (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Not a valid ID');
  }
  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((err) => {
    res.status(400).send(err);
  });
});

// Update a Todo record
app.patch('/todos/:id',  authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);
  
  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Not a valid ID');
  }

  if (_.isBoolean(body.completed)  && body.completed) {
    body.completedAt = new Date().getTime();
  }
  else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  }, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((err) => {
    res.status(400).send(err);
  });
});

/*-----------------------------------------------------------------------------
 Users
-----------------------------------------------------------------------------*/

// Create new User record
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((err) => {
    res.status(400).send(err);
  });
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// Return all User records
app.get('/users', (req, res) => {
  User.find().then((users) => {
    res.send({users});
  }).catch((err) => {
    res.status(400).send(err);
  });
});

/*-----------------------------------------------------------------------------
 Login
-----------------------------------------------------------------------------*/

app.post('/users/login', (req, res) => {
  var {email, password} = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(email, password).then((user) => {
    user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch((err) => {
    res.status(400).send(err);
  });
});

/*-----------------------------------------------------------------------------
 Listen
-----------------------------------------------------------------------------*/

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};