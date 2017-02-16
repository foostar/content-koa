const app = require('../app').listen()
const request = require('supertest');


const Content = require('db/mongo/content');

describe('content', function () {
    let testContent = {title: 'Hello', content: '<h1>hello world</h1>', category:'other'};
    let token, accountId, contentId;
    before(async function() {
        let res = await request(app)
                .post('/api/signin')
                .send({username: 'test', password: '123456'});
        token = res.body.data.token;
        accountId = res.body.data.id;
        res = await request(app).post('/api/content').set('Authorization', `Bearer ${token}`).send(testContent);
        contentId = res.body.data.id;

    });

    after(async function () {
        await Content.remove({author:accountId}).exec()
    });
    
    describe('create', function () {
        it('should return 200', async function () {
            const res = await request(app)
                    .post('/api/content')
                    .set('Authorization', `Bearer ${token}`)
                    .send(testContent)
                    .expect(200);
        })
    });

    describe('list', function () {
        it('should return contents belong to account', async function () {
            return request(app)
                    .get('/api/content')
                    .query({skip:1, limit:1, fields:['id', 'author']})
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function(res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.contents.length !== 1) throw new Error("size unmatched");
                        if (res.body.data.contents[0].author !== accountId) throw new Error("content author isn't test");
                    });
        })
    });

    describe('show', function () {
        it('should return matched content', async function () {
            return request(app)
                    .get(`/api/content/${contentId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function(res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.id !== contentId) throw new Error("id unmatched");
                    });
        })
        it('should return not-found error', async function () {
            return request(app)
                    .get(`/api/content/000000000000000000000000`)
                    .query({skip:1, limit:1, fields:['id', 'author']})
                    .set('Authorization', `Bearer ${token}`)
                    .expect(404)
                    .expect(function(res) {
                        if (res.body.status.code !== 20404) throw new Error("code isn't 20404");
                    });
        })
    });


     describe('update', function () {
        it('should return modified content', async function () {
            return request(app)
                    .patch(`/api/content/${contentId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({title:'Hello 2'})
                    .expect(200)
                    .expect(function(res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.title !== 'Hello 2') throw new Error("result not modified");
                    });
        })
    });


    // describe('show', function () {
});
