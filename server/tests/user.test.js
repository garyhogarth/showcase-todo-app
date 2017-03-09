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
  it('should login a valid user', (done) => {
    const email = users[0].email;
    const password = users[0].password;

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
      .end(done);
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
      })
      .end(done);
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
      })
      .end(done);
  });
});