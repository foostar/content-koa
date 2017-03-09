const app = require('../app').listen();
const request = require('supertest');

const User = require('db/mongo/user');

describe('user', function () {
    let token, id;
    before(async function () {
        let res = await request(app)
                .post('/api/signin')
                .send({username: 'test', password: '123456'});
        token = res.body.data.token;
        id = res.body.data.id;
    });

    describe('create', function () {
        it('should return 200', async function () {
            return request(app)
                    .post('/api/users')
                    .set('Authorization', `Bearer ${token}`)
                    .send({'username': 'test_xxx', 'password': '123456', 'level': 1})
                    .expect(200);
        });
    });

    describe('update', function () {
        it('should return 200', async function () {
            return request(app)
                    .patch(`/api/users/${id}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({'bindUpstreams': ['313261643638353238313234']})
                    .expect(200)
                    .expect(function (res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.bindUpstreams[0] !== '313261643638353238313234') {
                            throw new Error("result isn't modified");
                        }
                    });
        });
    });

    describe('search by username', function () {
        it('should return 200', async function () {
            const res = await request(app)
                    .get('/api/users?username=test_xx')
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function (res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.users[0].username !== 'test_xxx') {
                            throw new Error('search fail');
                        }
                    });
            return User.remove({_id: res.body.data.users[0].id}).exec();
        });
    });
});
