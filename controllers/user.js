const jwt = require('jsonwebtoken');
const config = require('config');
const hash = require('utils/hash');
const User = require('db/mongo/user');
const _ = require('lodash')

function getToken (user, opt = {}) {
    if (!opt.expiresIn) {
        opt.expiresIn = '1d';
    }
    return jwt.sign(
        user,
        config.JWT_SECRET,
        opt
    );
}

exports.checkPassword = async (ctx, next) => {
    const {username, password} = ctx.request.body;
    const user = await User.findOne({username});
    if (!user) {
        ctx.status = 404;
        throw Error(10404);
    }

    if (hash(password) !== user.password) {
        ctx.status = 401;
        throw Error(10401);
    }
    next();
};

exports.signin = async (ctx, next) => {
    await next();
    const {username} = ctx.request.body;
    const user = await User.findOne({username});

    const token = getToken(_.pick(user, 'id', 'username', 'level'));

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
        throw Error(10422);
    }
    const user = await new User({username, password}).save();
    const token = getToken(_.pick(user, 'id', 'username', 'level'));
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
        throw Error(10404);
    }
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.omit(user, 'password')
    };
};

// 修改密码
exports.update = async (ctx, next) => {
    await next();

    const {username, newPassword} = ctx.query;
    const user = await User.findOne({username});

    user.password = newPassword;

    await user.save();

    const token = getToken(_.pick(user, 'id', 'username', 'level'));

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

// exports.destroy = async (ctx, next) => {
//     await next();

//     const {username} = ctx.request.body;
//     await User.remove({username});
//     ctx.body = {
//         status: {
//             code: 0,
//             message: 'success'
//         }
//     };
// };

