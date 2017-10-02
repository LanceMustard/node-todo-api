const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: 'first test todo'
}, {
  _id: new ObjectID(),
  text: 'second test todo'
}];

// Remove all Todo records before starting
beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);                 // raise error
        }

        Todo.find().then((docs) => {
          expect(docs.length).toBe(todos.length + 1);     // check that we have additional record/document in the database
          expect(docs[todos.length].text).toBe(text);     // check that the text matches what we expect
          done();                          // test complete
        }).catch((err) => done(err));      // raise any errors
      });
  });

  it('should not create a todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})                             // blank todo should fail save validation
      .expect(400)                          // this is a bad request  
      .end((err, res) => {
        if (err) {
          return done(err);                 // raise error
        }

        Todo.find().then((docs) => {
          expect(docs.length).toBe(todos.length);     // check that we do not have additional records/documents in the database
          done();                           // test complete
        }).catch((err) => done(err));       // raise any errors
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

  it ('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it ('should return 404 for non-object ids', (done) => {
    request(app)
    .get(`/todos/123`)
    .expect(404)
    .end(done);
  });
});