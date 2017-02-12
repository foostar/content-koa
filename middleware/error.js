const {merge} = require('lodash');

module.exports = () => async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = ctx.status || 500;
        ctx.body = merge({
            status: {
                code: 10500,
                message: err.message || 'unknow error'
            }
        }, ctx.body);
    }
};
