const {merge} = require('lodash');

const ERROR = {
    '10401': {
        status: {
            code: 10404,
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

