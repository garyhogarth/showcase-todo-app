const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { User } = require('./../models/user');
const { users, populateUsers } = require('./seed/seed');


beforeEach(populateUsers);

describe('POST /users', () => {
  it('should create a user', (done) => {
    const email = 'test@test.com';
    const password = 'alongpassword';

    request(app).post('/users')
      .send({
        email,
        password
      })
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({
          email
        }).then((user) => {
          expect(user).toExist();
          expect(user.email).toBe(email);
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation error for invalid email', (done) => {
    const email = 'abc';
    const password = '12345678';

    request(app).post('/users')
      .send({
        email,
        password
      })
      .expect(400)
      .end(done);
  });

//   it('should return validation error for invalid password', (done) => {
//     const email = 'anotheremail@test.com';
//     const password = '123';

//     request(app).post('/users')
//       .send({
//         email,
//         password
//       })
//       .expect(400)
//       .end(done);
//   });

  it('should not create a new user if one exists with same email', (done) => {
    const email = users[0].email;
    const password = 'alongpassword';

    request(app).post('/users')
      .send({
        email,
        password
      })
      .expect(400)
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app).get('/users/me')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
    })
    .end(done)
  });

  it('should return a 401 if not authenticated', (done) => {
    request(app).get('/users/me')
    .expect(401)
    .expect((res) => {
        expect(res.body).toEqual({});
    })
    .end(done)
  });

  it('should return a 401 if invalid token', (done) => {
    request(app).get('/users/me')
    .set('x-auth', 'abc')
    .expect(401)
    .expect((res) => {
        expect(res.body).toEqual({});
    })
    .end(done)
  });
});

describe('POST /users/login', () => {
  it('should login a valid user, return auth token and store it', (done) => {
    const email = users[1].email;
    const password = users[1].password;

    request(app).post('/users/login')
      .send({
        email,
        password
      })
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({
          email
        }).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not login a user that does not exist', (done) => {
    const email = 'doesnotexist@test.com';
    const password = 'abc';

    request(app).post('/users/login')
      .send({
        email,
        password
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({});
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({
          email
        }).then((user) => {
          expect(user).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not login a user with an invalid passowrd', (done) => {
    const email = users[0].email;
    const password = 'abc';

    request(app).post('/users/login')
      .send({
        email,
        password
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({});
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({
          email
        }).then((user) => {
          expect(user.tokens.length).toEqual(1);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove a users token', (done) => {
    request(app).delete('/users/me/token')
      .set('x-auth',users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /users/me/logout', () => {
  it('should redirect to /users/me/token', (done) => {
    request(app).delete('/users/me/logout')
      .set('x-auth',users[0].tokens[0].token)
      .expect(302)
      .expect((res) => {
        expect(res.headers.location).toBe('/me/token');
      })
      .end(done);
  });
});