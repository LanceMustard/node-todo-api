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
      .post('/todo')
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
        }).catch((err) => { done(err)});    // raise any errors
      })
      
  });
});