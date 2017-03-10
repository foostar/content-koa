const qiniu = require('qiniu');
const fetch = require('node-fetch');
const utils = qiniu.util;
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

exports.replaceSrc = async (ctx, next) => {
    let {bucket, key, path} = ctx.request.body;
    bucket = bucket || 'gp-baijia-public';
    key = key || Date.now();
    path = path || 'https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=3889134221,835523178&fm=170&s=4F301BC78AB2E5FF5EADB8100300A0C3&w=480&h=585&img.JPEG';
    path = utils.urlsafeBase64Encode(path);
    const EncodedEntryURI = `${bucket}:${key}`;
    const fetchUrl = `http://iovip.qbox.me/fetch/${path}/to/${EncodedEntryURI}`;
    const token = qiniu.util.generateAccessToken(fetchUrl);

    const res = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(response => response.json());

    ctx.assert(res.key, 400, '操作失败', {code: 1030001});

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: res
    };
};

