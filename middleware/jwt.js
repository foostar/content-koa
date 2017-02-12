const jwt = require('koa-jwt');
const config = require('config');

module.exports = (opt = {}) => {
    return jwt({
        secret: config.JWT_SECRET,
        audience: opt.audience,
        issuer: opt.issuer
    });
};

