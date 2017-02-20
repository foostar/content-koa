const {merge} = require('lodash');

const ERROR = {
    '10401': {
        status: {
            code: 10401,
            message: '密码错误'
        }
    },
    '10403': {
        status: {
            code: 10403,
            message: '没有权限'
        }
    },
    '10404': {
        status: {
            code: 10404,
            message: '没有该用户'
        }
    },
    '10422': {
        status: {
            code: 10422,
            message: '用户已存在'
        }
    },
    '20404': {
        status: {
            code: 20404,
            message: '没有该文章'
        }
    },
    '20403': {
        status: {
            code: 20403,
            message: '没有修改此文章的权限'
        }
    },
    '30404': {
        status: {
            code: 30404,
            message: '上游帐号不存在'
        }
    },
    '30422': {
        status: {
            code: 30422,
            message: '重复的平台帐号'
        }
    }
};

module.exports = () => async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = ctx.status || 500;

        ctx.body = ERROR[err.message] || merge({
            status: {
                code: 10500,
                message: err.message || 'unknow error'
            }
        }, ctx.body);
    }
};

