const qiniu = require('qiniu');
const {QINIU_ACCESS_KEY, QINIU_SECRET_KEY} = require('config');

qiniu.conf.ACCESS_KEY = QINIU_ACCESS_KEY;
qiniu.conf.SECRET_KEY = QINIU_SECRET_KEY;

exports.uptoken = async (ctx, next) => {
    const {bucket, key} = ctx.query;

    ctx.assert(bucket, 400, '缺少 bucket 参数', {code: 1030001});
    ctx.assert(key, 400, '缺少 key 参数', {code: 1030001});

    const token = new qiniu.rs.PutPolicy(`${bucket}:${key}`).token();
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: {
            bucket,
            key,
            token
        }
    };
};

