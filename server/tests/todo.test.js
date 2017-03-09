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


const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333
}];

const id = todos[0]._id.toHexString();
const id2 = todos[1]._id.toHexString();
const invalidId = 'abc';
const unknownId = new ObjectID().toHexString();

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
  it(`should get an individual todo for id(${id})`, (done) => {
    request(app)
      .get(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toEqual(id);
      })
      .end(done);
  });

  it(`should send a 404 if an invalid ID (${invalidId}) is sent`, (done) => {
    request(app)
      .get(`/todos/${invalidId}`)
      .expect(404)
      .end(done);
  });

  it(`should send a 404 if an unknown ID (${unknownId}) is sent`, (done) => {
    request(app)
      .get(`/todos/${unknownId}`)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {

  it(`should delete an individual todo matching id(${id})`, (done) => {
    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toEqual(id);
      })
      .end((err, res) => {
        if (err) {
           return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
        
      });
  });

  it(`should send a 404 if an invalid ID (${invalidId}) is sent`, (done) => {
    request(app)
      .delete(`/todos/${invalidId}`)
      .expect(404)
      .end(done);
  });

  it(`should send a 404 if an unknown ID (${unknownId}) is sent`, (done) => {
    request(app)
      .delete(`/todos/${unknownId}`)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {

  it(`should update an individual todo as complete (${id})`, (done) => {
    request(app)
      .patch(`/todos/${id}`)
      .send({
        completed: true
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toEqual(id);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });

  it(`should update an individual todo as not complete (${id2})`, (done) => {
    request(app)
      .patch(`/todos/${id2}`)
      .send({
        completed: false
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toEqual(id2);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });

  it(`should send a 404 if an invalid ID (${invalidId}) is sent`, (done) => {
    request(app)
      .patch(`/todos/${invalidId}`)
      .send({
        completed: false
      })
      .expect(404)
      .end(done);
  });

  it(`should send a 404 if an unknown ID (${unknownId}) is sent`, (done) => {
    request(app)
      .patch(`/todos/${unknownId}`)
      .send({
        completed: false
      })
      .expect(404)
      .end(done);
  });
});