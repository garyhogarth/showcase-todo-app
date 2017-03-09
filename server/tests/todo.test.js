const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { todos, users, populateTodos } = require('./seed/seed');

beforeEach(populateTodos);

const id = todos[0]._id.toHexString();
const id2 = todos[1]._id.toHexString();
const invalidId = 'abc';
const unknownId = new ObjectID().toHexString();

describe('POST /todos', () => {
  it('should create a new todo if authorised', (done) => {
    const text = 'Test todo text';

    request(app).post('/todos')
      .send({
        text
      })
      .set('x-auth', users[0].tokens[0].token)
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
          expect(todos[0]._creator.toHexString()).toBe(users[0]._id.toHexString());
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create a new todo if no data sent', (done) => {
    request(app).post('/todos')
      .send({})
      .set('x-auth', users[0].tokens[0].token)
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

  it('should not create a new todo if not authorised', (done) => {
    const text = 'Test todo text';
    request(app).post('/todos')
      .send({
        text
      })
      .expect(401)
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
  it('should show all todos for a user if authorised', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
        expect(res.body.todos[0]._creator).toBe(users[0]._id.toHexString());
      })
      .end(done);
  });

  it('should not get any todos if not authorised', (done) => {
    request(app)
      .get('/todos')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it(`should get an individual todo if owned by authorised user`, (done) => {
    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toEqual(id);
      })
      .end(done);
  });

  it(`should not get an individual todo if not owned by authorised user`, (done) => {
    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it(`should send a 404 if an invalid ID is sent`, (done) => {
    request(app)
      .get(`/todos/${invalidId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it(`should send a 404 if an unknown ID is sent`, (done) => {
    request(app)
      .get(`/todos/${unknownId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should send a 401 if not authorised at all', (done) => {
    request(app)
      .get(`/todos/${id}`)
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {

  it(`should delete an individual todo matching id if owned by authorised user`, (done) => {
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
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


  it(`should not delete an individual todo matching id if not owned by authorised user`, (done) => {
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end((err, res) => {
        if (err) {
           return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo).toExist();
          done();
        }).catch((e) => done(e));
        
      });
  });

  it(`should send a 404 if an invalid ID is sent`, (done) => {
    request(app)
      .delete(`/todos/${invalidId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it(`should send a 404 if an unknown ID is sent`, (done) => {
    request(app)
      .delete(`/todos/${unknownId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it(`should send a 401 if not authorised al all`, (done) => {
    request(app)
      .delete(`/todos/${id}`)
      .expect(401)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {

  it(`should update an individual todo as complete if owned by authorised user`, (done) => {
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        completed: true
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toEqual(id);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end((err, res) => {
        if (err) {
           return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo.completed).toBe(true);
          done();
        }).catch((e) => done(e));
        
      });
  });

  it(`should not update an individual todo as complete if not owned by authorised user`, (done) => {
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: true
      })
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end((err, res) => {
        if (err) {
           return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo.completed).toBe(false);
          done();
        }).catch((e) => done(e));
        
      });
  });

  it(`should update an individual todo as not complete if owned by authorised user`, (done) => {
    request(app)
      .patch(`/todos/${id2}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: false
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toEqual(id2);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end((err, res) => {
        if (err) {
           return done(err);
        }

        Todo.findById(id2).then((todo) => {
          expect(todo.completed).toBe(false);
          done();
        }).catch((e) => done(e));
        
      });
  });

  it(`should not update an individual todo as not complete if owned by not authorised user`, (done) => {
    request(app)
      .patch(`/todos/${id2}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        completed: false
      })
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end((err, res) => {
        if (err) {
           return done(err);
        }

        Todo.findById(id2).then((todo) => {
          expect(todo.completed).toBe(true);
          done();
        }).catch((e) => done(e));
        
      });
  });

  it(`should send a 404 if an invalid ID is sent`, (done) => {
    request(app)
      .patch(`/todos/${invalidId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: false
      })
      .expect(404)
      .end(done);
  });

  it(`should send a 404 if an unknown ID is sent`, (done) => {
    request(app)
      .patch(`/todos/${unknownId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: false
      })
      .expect(404)
      .end(done);
  });

  it(`should send a 401 if not authorised`, (done) => {
    request(app)
      .patch(`/todos/${id}`)
      .send({
        completed: false
      })
      .expect(401)
      .end(done);
  });
});