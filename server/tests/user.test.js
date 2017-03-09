const expect = require('expect');
const request = require('supertest');
const {
  ObjectID
} = require('mongodb');

const { app } = require('./../server');
const { User } = require('./../models/user');


const mockUsers = [{
  email: 'test1@test.com',
  password: '123'
}];


beforeEach((done) => {
  User.remove({}).then(() => {
    return User.insertMany(mockUsers);
  }).then(() => {
    done();
  });
})

describe('POST /users', () => {
  it('should create a new user', (done) => {
    const email = 'test@test.com';
    const password = '123';

    request(app).post('/users')
      .send({
        email,
        password
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find({
          email
        }).then((users) => {
          expect(users.length).toBe(1);
          expect(users[0].email).toBe(email);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('POST /users', () => {
  it('should not create a new user if one exists with same email', (done) => {
    const email = mockUsers[0].email;
    const password = '123';

    request(app).post('/users')
      .send({
        email,
        password
      })
      .expect(400)
      .end(done);
  });
});