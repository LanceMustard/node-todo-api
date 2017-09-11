const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// Remove all Todo records before starting
beforeEach((done) => {
  Todo.remove({}).then(() => done());
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

        Todo.find().then((todos) => {
          expect(todos.length).toBe(1);     // check that we have 1 record/document in the database
          expect(todos[0].text).toBe(text); // check that the text matches what we expect
          done();                           // test complete
        }).catch((err) => done(err));       // raise any errors
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

        Todo.find().then((todos) => {
          expect(todos.length).toBe(0);     // check that we have 0 records/documents in the database
          done();                           // test complete
        }).catch((err) => done(err));       // raise any errors
      });
  });
});