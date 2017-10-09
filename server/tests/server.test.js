const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


// seed test data
beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err); // raise error
        }

        Todo.find().then((docs) => {
          expect(docs.length).toBe(todos.length + 1); // check that we have additional record/document in the database
          expect(docs[todos.length].text).toBe(text); // check that the text matches what we expect
          done(); // test complete
        }).catch((err) => done(err)); // raise any errors
      });
  });

  it('should not create a todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({}) // blank todo should fail save validation
      .expect(400) // this is a bad request
      .end((err, res) => {
        if (err) {
          return done(err); // raise error
        }

        Todo.find().then((docs) => {
          expect(docs.length).toBe(todos.length); // check that we do not have additional records/documents in the database
          done(); // test complete
        }).catch((err) => done(err)); // raise any errors
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should get a single todo', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return a todo created by another user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get(`/todos/123`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should delete a single todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId); // check the return deleted object matched the one we wanted to delete
      })
      .end((err, res) => {
        if (err) {
          return done(err); // raise error
        }
        // check that the object is no longer in the database
        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeFalsy();
          done(); // test complete
        }).catch((err) => done(err)); // raise any errors
      });
  });

  it('should not delete another users todo record', (done) => {
    var hexId = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err); // raise error
        }
        // check that the object is still in the database
        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeTruthy();
          done(); // test complete
        }).catch((err) => done(err)); // raise any errors
      });
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .delete('/todos/123')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    let hexId = todos[0]._id.toHexString();
    let body = {
      text: 'Completed task',
      completed: true
    };
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(body)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.todo.text).toBe(body.text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toEqual(expect.any(Number));
        done();
      });
  });

  it('should clear completedAt when todo is not completed', (done) => {
    let hexId = todos[1]._id.toHexString();
    let body = {
      text: 'Incompleted task',
      completed: false
    };
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send(body)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.todo.text).toBe(body.text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeNull();
        done();
      });
  });

  it('should not update other users the todo record', (done) => {
    let hexId = todos[0]._id.toHexString();
    let body = {
      text: 'Completed task',
      completed: true
    };
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send(body)
      .expect(404)
      .end((err) => {
        if (err) {
          return done(err);
        }
        // check changes did not occure in database
        Todo.findOne({
          _id: hexId,
          _creator: users[0]._id.toHexString()
        }).then((todo) => {
          expect(todo.text).not.toBe(body.text);
          expect(todo.completed).not.toBe(true);
          expect(todo.completedAt).not.toEqual(expect.any(Number));
          done();
        }).catch((err) => done(err));
      });
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});


describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'test@example.com';
    var password = '123abc!';
    request(app)
      .post('/users')
      .set('x-auth', users[0].tokens[0].token)
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toEqual(expect.anything());
        expect(res.body._id).toEqual(expect.anything());
        expect(res.body.email).toEqual(expect.anything());
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toEqual(expect.anything());
          expect(user.password).not.toBe(password);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    var email = 'newuser'; // invalid
    var password = '111'; // too small
    request(app)
      .post('/users')
      .set('x-auth', users[0].tokens[0].token)
      .send({email, password})
      .expect(400)
      .end(done);
  });

  it('should not create user if email is use', (done) => {
    var email = users[0].email; // already exists
    var password = '111abc!';
    request(app)
      .post('/users')
      .set('x-auth', users[0].tokens[0].token)
      .send({email, password})
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    var email = users[1].email;
    var password = users[1].password;
    request(app)
      .post('/users/login')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toEqual(expect.anything());
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id.toHexString()).then((user) => {
          expect(user.tokens[1].access).toBe('auth');
          expect(user.tokens[1].token).toBe(res.headers['x-auth']);
          done(); 
        }).catch((err) => done(err));
      });
  });

  it('should rejected invalid login', (done) => {
    var email = users[1].email;
    var password = 'theWrongPassword';
    request(app)
      .post('/users/login')
      .send({email, password})
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).not.toEqual(expect.anything());
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id.toHexString()).then((user) => {
          expect(user.tokens.length).toBe(1);
          done(); 
        }).catch((err) => done(err));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id.toHexString()).then((user) => {
          expect(user.tokens.length).toBe(0);
          done(); 
        }).catch((err) => done(err));
      });
  });
});