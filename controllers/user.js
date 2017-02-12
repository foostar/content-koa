const jwt = require('jsonwebtoken');
const config = require('config');
const hash = require('utils/hash');
const User = require('db/mongo/user');

function getToken (username, opt = {}) {
    if (!opt.expiresIn) {
        opt.expiresIn = '1d';
    }
    return jwt.sign(
        {username},
        config.JWT_SECRET,
        opt
    );
}

exports.checkPassword = async (ctx, next) => {
    const {username, password} = ctx.request.body;
    const user = await User.findOne({username});

    if (!user) {
        ctx.status = 404;
        ctx.body = {
            status: {
                code: 10404,
                message: '用户不存在'
            }
        };
        return;
    }

    if (hash(password) !== user.password) {
        ctx.status = 401;
        ctx.body = {
            status: {
                code: 10401,
                message: '密码错误'
            }
        };
        return;
    }
    next();
};

exports.signin = async (ctx, next) => {
    const {username} = ctx.request.body;
    const user = await User.findOne({username});

    const token = getToken(username);

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: {
            username,
            id: user.id,
            token
        }
    };
};

exports.signup = async (ctx, next) => {
    const {username, password} = ctx.request.body;
    if (await User.findOne({username})) {
        ctx.status = 422;
        ctx.body = {
            status: {
                code: 10422,
                message: '用户名已被注册'
            }
        };
        return;
    }
    const user = await new User({username, password}).save();
    const token = getToken(username);
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: {
            username,
            id: user.id,
            token
        }
    };
};

exports.show = async (ctx, next) => {
    const {id} = ctx.params;
    const user = await User.findOne({id}, {
        username: true,
        level: true,
        _id: false,
        id: true,
        createdAt: true,
        updatedAt: true
    });
    if (!user) {
        ctx.status = 404;
        ctx.body = {
            status: {
                code: 10404,
                message: '用户不存在'
            }
        };
        return;
    }
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: {
            user
        }
    };
};

// 修改密码
exports.update = async (ctx, next) => {
    const {username, newPassword} = ctx.query;
    const user = await User.findOne({username});

    user.password = newPassword;

    await user.save();

    const token = getToken(username);

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: {
            username,
            id: user.id,
            token
        }
    };
};

exports.destroy = async (ctx, next) => {
    const {username} = ctx.request.body;
    await User.remove({username});
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        }
    };
};

