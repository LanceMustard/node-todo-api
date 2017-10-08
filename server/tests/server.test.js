const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


// seed test data
beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
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
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(todos.length);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should get a single todo', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should delete a single todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId); // check the return deleted object matched the one we wanted to delete
      })
      .end((err, res) => {
        if (err) {
          return done(err); // raise error
        }
        // check that out object is no longer in the database
        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeFalsy();
          done(); // test complete
        }).catch((err) => done(err)); // raise any errors
      });
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .delete('/todos/123')
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
});