const expect = require('expect');
const request = require('supertest');
const {
  ObjectID
} = require('mongodb');

const {
  app
} = require('./../server');
const {
  Todo
} = require('./../models/todo');

const id = new ObjectID();

const todos = [{
  text: 'First test todo'
}, {
  _id: id,
  text: 'Second test todo'
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => {
    done();
  });
})

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test todo text';

    request(app).post('/todos')
      .send({
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({
          text
        }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create a new todo', (done) => {
    request(app).post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2)
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it(`should get an individual todo for id(${id.toHexString()})`, (done) => {
    request(app)
      .get(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toEqual(id);
      })
      .end(done);
  });

  const invalidId = id.toHexString() + 'abc';
  it(`should send a 404 if an invalid ID (${invalidId}) is sent`, (done) => {
    request(app)
      .get(`/todos/${invalidId}`)
      .expect(404)
      .end(done);
  });

  const newId = new ObjectID();
  it(`should send a 404 if an unknown ID (${newId.toHexString()}) is sent`, (done) => {
    request(app)
      .get(`/todos/${newId}`)
      .expect(404)
      .end(done);
  });
});