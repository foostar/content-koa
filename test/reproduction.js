const app = require('../app').listen();
const request = require('supertest');
const _ = require('lodash');
const Reproduction = require('db/mongo/reproduction');

describe('reproduction', function () {
    let token;
    before(async function () {
        let res = await request(app)
                .post('/api/signin')
                .send({username: 'test', password: '123456'});
        token = res.body.data.token;
    });

    after(async function () {
        Reproduction.remove({custom: 'test'}).exec();
    });

    describe('upsert', function () {
        it('should return 200', async function () {
            const id = encodeURIComponent('majihua.baijia.baidu.com/article/783077');
            const data = {
                upstream: '0'.repeat(24),
                content: '0'.repeat(24),
                publishAt: (new Date()).toISOString(),
                custom: 'test'
            };
            const match = _.matches(data);

            await request(app)
                    .post(`/api/reproduction/${id}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send(data)
                    .expect(200);

            return request(app)
                    .get(`/api/reproduction/${id}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function (res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (!match(res.body.data)) throw new Error("return data don't match");
                    });
        });
    });

    before(async function () {
        let r = [];
        for (var i = 0; i < 10; i++) {
            const id = '1'.repeat(23) + i.toString();
            const data = {
                upstream: '1'.repeat(23) + (i % 2).toString(),
                content: '1'.repeat(23) + ((i + 1) % 2).toString(),
                custom: 'test',
                view: i
            };
            r.push(request(app).post(`/api/reproduction/${id}`).set('Authorization', `Bearer ${token}`).send(data));
        }
        return Promise.all(r);
    });

    describe('search', function () {
        it('should return matched data', async function () {
            const upstream = '1'.repeat(24);
            return request(app)
                    .get(`/api/reproduction`)
                    .query({upstreams: [upstream]})
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function (res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        if (res.body.data.count !== 5) throw new Error('incorrect size of data');
                        if (_.some(res.body.data.reproductions, x => x.upstream !== upstream)) throw new Error('upstream not equal');
                    });
        });
    });

    describe('stat', function () {
        it('should return correct total', async function () {
            const upstreams = ['1'.repeat(24), '1'.repeat(23) + '0'];
            return request(app)
                    .get(`/api/reproduction/stat`)
                    .query({groupBy: 'upstream', upstreams: upstreams})
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .expect(function (res) {
                        if (res.body.status.code !== 0) throw new Error("code isn't 0");
                        for (var i = res.body.data.length - 1; i >= 0; i--) {
                            if (res.body.data[i] === upstreams[0] && res.body.data[i].total !== 25) throw new Error('total not equal to 25');
                            if (res.body.data[i] === upstreams[1] && res.body.data[i].total !== 20) throw new Error('total not equal to 20');
                        }
                    });
        });
    });
});
