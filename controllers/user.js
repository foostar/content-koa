const jwt = require('jsonwebtoken');
const config = require('config');
const hash = require('utils/hash');
const User = require('db/mongo/user');
const _ = require('lodash');

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

const RETURN_FIELDS = ['id', 'username', 'bindUpstreams', 'level', 'createdAt', 'updatedAt'];

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

// exports.signup = async (ctx, next) => {
//     const {username, password} = ctx.request.body;
//     if (await User.findOne({username})) {
//         ctx.status = 422;
//         throw Error(10422);
//     }
//     const user = await new User({username, password}).save();
//     const token = getToken(_.pick(user, 'id', 'username', 'level'));
//     ctx.body = {
//         status: {
//             code: 0,
//             message: 'success'
//         },
//         data: {
//             username,
//             id: user.id,
//             token
//         }
//     };
// };

exports.list = async (ctx, next) => {
    let {limit = 20, skip = 0} = ctx.query;
    limit = Math.max(Math.min(limit, 100), 20);
    const users = await User.find(
        {level: { $gt: 0 }},
        null,
        {skip, limit}
    );
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: users.map(user => _.pick(user, RETURN_FIELDS))
    };
};

exports.show = async (ctx, next) => {
    const {id} = ctx.params;
    const user = await User.findOne({id});
    if (!user) {
        ctx.status = 404;
        throw Error(10404);
    }
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(user, RETURN_FIELDS)
    };
};

exports.create = async (ctx, next) => {
    const operator = ctx.state.user;
    const {username, password, level, bindUpstreams} = ctx.request.body;

    if (!username || !password || !level) { // !0 -> true
        throw Error(11400);
    }

    if (operator.level !== 0 && operator.level <= level) {
        throw Error(11401);
    }

    if (await User.findOne({username})) {
        throw Error(11422);
    }

    const user = await new User({
        username, password, level, bindUpstreams
    }).save();

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(user, RETURN_FIELDS)
    };
};

// 修改密码
exports.changePassword = async (ctx, next) => {
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

exports.update = async (ctx) => {
    if (ctx.state.user.level === 1) {
        ctx.status = 403;
        throw Error(11401);
    }

    const user = await User.findById(ctx.params.id);
    if (!user) {
        ctx.status = 404;
        throw Error(10404);
    }

    let update = _.pick(ctx.request.body, 'bindUpstreams', 'level', 'password');

    if (update.level === 0 && ctx.state.user.level !== 0) {
        ctx.status = 403;
        throw Error(11401);
    }

    _.assign(user, update);

    await user.save();

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(user, RETURN_FIELDS)
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

