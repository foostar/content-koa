const app = require('../app').listen();
const request = require('supertest');
// const _ = require('lodash');

const User = require('db/mongo/user');
let user;
before(async function () {
    user = await User.findOne({'username': 'test'});
    if (!user) {
        user = await new User({
            'username': 'test',
            'password': '123456',
            'level': 0
        }).save();
    }
});

after(async function () {
    await user.remove();
});

describe('base', function () {
    describe('home page', function () {
        it('should return 200', async function () {
            return request(app)
                .get('/')
                .expect(200);
        });
    });

    describe('signup', function () {
        it('should return user object and jwt', async function () {
            return request(app)
                .post('/api/signin')
                .set('Content-Type', 'application/json')
                .send({username: 'test', password: '123456'})
                .expect(200)
                .expect(function (res) {
                    if (res.body.status.code !== 0) throw new Error("code isn't 0");
                    if (res.body.data.username !== 'test') throw new Error('username unmatched');
                    if (!('token' in res.body.data)) throw new Error('missing token');
                });
        });

        it('should return error when send non-existent user', async function () {
            return request(app)
                .post('/api/signin')
                .set('Content-Type', 'application/json')
                .send({username: 'non-exist', password: '123456'})
                .expect(function (res) {
                    if (res.body.status.code !== 10404) throw new Error("code isn't 10404");
                });
        });

        it('should return error when use wrong password', async function () {
            return request(app)
                .post('/api/signin')
                .set('Content-Type', 'application/json')
                .send({username: 'test', password: 'wrong password'})
                .expect(function (res) {
                    if (res.body.status.code !== 10401) throw new Error("code isn't 10401");
                });
        });
    });
});
