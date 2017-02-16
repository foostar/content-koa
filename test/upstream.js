const app = require('../app').listen()
const request = require('supertest');
const _ = require('lodash')
const Upstream = require('db/mongo/upstream')

describe('upstream', function () {
    let token, upstreamId
    before(async function() {
        let res = await request(app)
                .post('/api/signin')
                .send({username: 'test', password: '123456'});
        token = res.body.data.token;
        accountId = res.body.data.id;

        Upstream.remove({creater: accountId}).exec()

        res = await request(app)
                    .post('/api/upstream')
                    .set('Authorization', `Bearer ${token}`)
                    .send({platform: 'test', account:'test', session: 'a=1;b=2'})
        if (res.body.status.code == 0){
            upstreamId = res.body.data.id;
        }

        await request(app)
                    .post('/api/upstream')
                    .set('Authorization', `Bearer ${token}`)
                    .send({platform: 'test', account:'test2', session: 'a=1;b=2'})
    });

    after(async function () {
        Upstream.remove({creater: accountId}).exec()
    })

    
    describe('create', function () {
        it('should return 200', async function () {          
            const res = await request(app)
                    .post('/api/upstream')
                    .set('Authorization', `Bearer ${token}`)
                    .send({platform: 'tencent', account:'123456@qq.com', session: 'a=1;b=2'})
                    .expect(200)
        })
    });

    describe('show', function () {
        it('should return upstream account', async function () {
            return request(app)
                    .get(`/api/upstream/${upstreamId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function(res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.id !== upstreamId) throw new Error("id unmatched");
                    });
        })
        it('should return not-found error', async function () {
            return request(app)
                    .get(`/api/upstream/000000000000000000000000`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(404)
                    .expect(function(res) {
                        if (res.body.status.code !== 30404) throw new Error("code isn't 30404");
                    });
        })
    });

    describe('update', function () {
        it('should return modified upstream', async function () {
            return request(app)
                    .patch(`/api/upstream/${upstreamId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({session:'modified'})
                    .expect(200)
                    .expect(function(res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.session !== 'modified') throw new Error("session isn't modified");
                    });
        })
    });

    describe('list', function () {
        it('should return upstreams', async function () {
            return request(app)
                    .get(`/api/upstream`)
                    .query({'account':'t'})
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function(res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (!_.every(res.body.data.upstreams, x => _.startsWith(x.account, 't'))) throw new Error("account isn't start with `t`");
                    });
        })
    });


});
