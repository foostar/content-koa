const app = require('../app').listen();
const request = require('supertest');

const Content = require('db/mongo/content');

describe('content', function () {
    let testContent = {title: 'Hello', type: 'article', content: '<h1>hello world</h1>', category: 'other'};
    let token, accountId, contentId;
    before(async function () {
        let res = await request(app)
                .post('/api/signin')
                .send({username: 'test', password: '123456'});
        token = res.body.data.token;
        accountId = res.body.data.id;
        res = await request(app).post('/api/content').set('Authorization', `Bearer ${token}`).send(testContent);
        contentId = res.body.data.id;
    });

    after(async function () {
        await Content.remove({author: accountId}).exec();
    });

    describe('create', function () {
        it('should return 200', async function () {
            // const res =
            await request(app)
                    .post('/api/content')
                    .set('Authorization', `Bearer ${token}`)
                    .send(testContent)
                    .expect(200);
        });
    });

    describe('list', function () {
        it('should return contents belong to account', async function () {
            return request(app)
                    .get('/api/content')
                    .query({skip: 1, limit: 1, fields: ['id', 'author']})
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function (res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.contents.length !== 1) throw new Error('size unmatched');
                        if (res.body.data.contents[0].author !== accountId) throw new Error("content author isn't test");
                    });
        });
    });

    describe('show', function () {
        it('should return matched content', async function () {
            return request(app)
                    .get(`/api/content/${contentId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function (res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.id !== contentId) throw new Error('id unmatched');
                    });
        });
        it('should return not-found error', async function () {
            return request(app)
                    .get(`/api/content/000000000000000000000000`)
                    .query({skip: 1, limit: 1, fields: ['id', 'author']})
                    .set('Authorization', `Bearer ${token}`)
                    .expect(404)
                    .expect(function (res) {
                        if (res.body.status.code !== 20404) throw new Error("code isn't 20404");
                    });
        });
    });

    describe('update', function () {
        it('should return modified content', async function () {
            return request(app)
                    .patch(`/api/content/${contentId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({title: 'Hello 2'})
                    .expect(200)
                    .expect(function (res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.title !== 'Hello 2') throw new Error('result not modified');
                    });
        });
    });

    describe('tag', function () {
        it('should return content with added tags', async function () {
            const tag = 'test1';
            await request(app)
                    .post(`/api/content/${contentId}/tag/${tag}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function (res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.tags.indexOf(tag) === -1) throw new Error("it doesn't contain new tag");
                    });

            return request(app)
                    .get(`/api/content/${contentId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function (res) {
                        if (res.body.data.tags.indexOf(tag) === -1) throw new Error("it doesn't contain new tag when re-query content");
                    });
        });

        it('should return content that deleted the specified tag', async function () {
            const tag = 'test2';
            await request(app)
                    .post(`/api/content/${contentId}/tag/${tag}`)
                    .set('Authorization', `Bearer ${token}`);

            return request(app)
                    .del(`/api/content/${contentId}/tag/${tag}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function (res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.tags.indexOf(tag) !== -1) throw new Error('it does contain the deleted tag');
                    });
        });
    });

    describe('most-common-tags', function () {
        it('should return most common tags', async function () {
            let r = [];
            for (var i = 0; i <= 50; i++) {
                let tag = 1;
                while (Math.random() < 0.85) {
                    tag++;
                }
                r.push(request(app).post(`/api/content/${contentId}/tag/${tag}`).set('Authorization', `Bearer ${token}`));
            }
            await Promise.all(r);

            return request(app)
                    .get(`/api/content/most-common-tags`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function (res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.tags.indexOf('1') === -1) throw new Error("it doesn't contain the most frequently-used item");
                        if (res.body.data.tags.indexOf('2') === -1) throw new Error("it doesn't contain the second frequently-used item");
                        if (res.body.data.tags.indexOf('3') === -1) throw new Error("it doesn't contain the third frequently-used item");
                    });
        });
    });

    describe('search', function () {
        before(async function () {
            let r = [];
            for (var i = 1; i <= 5; i++) {
                let con = {title: 'Hello', type: 'article', content: `<h1>hello world token${i} </h1>`, tags: [`t${i}`, `t${i + 1}`, `t${i + 2}`, `t${i + 3}`], category: 'other'};
                r.push(request(app).post('/api/content').set('Authorization', `Bearer ${token}`).send(con));
            }
            await Promise.all(r);
        });

        it('should return contents', async function () {
            return request(app)
                    .get('/api/content/search')
                    .query({
                        includeTags: ['t3', 't4'],
                        excludeTags: ['t6'],
                        fields: ['id', 'tags', 'content'],
                        keyword: 'token1'
                    })
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function (res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.contents[0].tags.indexOf('t1') === -1) throw new Error("it doesn't contain t1");
                    });
        });
    });
});
