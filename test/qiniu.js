const app = require('../app').listen();
const request = require('supertest');

describe('七牛图片测试', function () {
    it('默认返回豆瓣金刚狼图片', async function () {
        return request(app)
                .post('/api/qiniu/replace-src')
                .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4YTY3NzVkMGM5MWE3MDI4MjdhMzg1OCIsInVzZXJuYW1lIjoibG92ZXNvbmciLCJsZXZlbCI6MCwiaWF0IjoxNDg4ODU5MjQwLCJleHAiOjE0ODk0NjQwNDB9.vT6eOw3kMbbTDC6UW994igHCe6u7siVF6ldntGGmTDI`)
                .expect(200)
                .expect(function (res) {
                    if (res.body.status.code !== 0) throw new Error("code isn't 0");
                    if (!res.body.data.key) throw new Error('上传失败');
                });
    });
    it('成功返回替换图片', async function () {
        const data = { path: 'http://mmbiz.qpic.cn/mmbiz/k0UVxv3BTLJs4606VnwPsT5ibjaDicX7GicAyicC0OpEFFWUEWxTZEb6OXxibdAdsuujgacoLv8vEmRytibqEH4al8WA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1' };
        return request(app)
                .post('/api/qiniu/replace-src')
                .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4YTY3NzVkMGM5MWE3MDI4MjdhMzg1OCIsInVzZXJuYW1lIjoibG92ZXNvbmciLCJsZXZlbCI6MCwiaWF0IjoxNDg4ODU5MjQwLCJleHAiOjE0ODk0NjQwNDB9.vT6eOw3kMbbTDC6UW994igHCe6u7siVF6ldntGGmTDI`)
                .send(data)
                .expect(200)
                .expect(function (res) {
                    if (res.body.status.code !== 0) throw new Error("code isn't 0");
                    if (!res.body.data.key) throw new Error('上传失败');
                });
    });
});
