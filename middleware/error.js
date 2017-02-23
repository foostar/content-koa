const {merge} = require('lodash');

const ERROR = {
    '10401': {
        status: {
            code: 10401,
            message: '密码错误'
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
    '11400': {
        status: {
            code: 11400,
            message: '参数不全'
        }
    },
    '11401': {
        status: {
            code: 11401,
            message: '操作权限不够'
        }
    },
    '11422': {
        status: {
            code: 11422,
            message: '用户名已存在'
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
        if (err.status === 401) {
            ctx.status = 401;
            ctx.body = {
                status: {
                    code: 99401,
                    message: '认证信息失效, 请重新登录'
                }
            };
        } else {
            ctx.status = ctx.status || 500;
            ctx.body = ERROR[err.message] || merge({
                status: {
                    code: 99500,
                    message: err.message || 'unknow error'
                }
            }, ctx.body);
        }
    }
};

