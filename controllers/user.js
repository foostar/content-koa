const jwt = require('jsonwebtoken');
const config = require('config');
const hash = require('utils/hash');
const User = require('db/mongo/user');
const _ = require('lodash');

function getToken (user, opt = {}) {
    if (!opt.expiresIn) {
        opt.expiresIn = '7d';
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

    ctx.assert(user, 404, '没有该用户', {code: 100001});

    ctx.assert(
        hash(password) === user.password,
        400,
        '密码错误',
        {code: 100002}
    );
    await next();
};

exports.signin = async (ctx, next) => {
    // await next();
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
            level: user.level,
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
    ctx.assert(user, 404, '没有该用户', {code: 100001});
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

    ctx.assert(username, 400, '缺少 username 参数', {code: 100002});
    ctx.assert(password, 400, '缺少 password 参数', {code: 100002});
    ctx.assert(level, 400, '缺少 level 参数', {code: 100002});

    ctx.assert(operator.level === 0, '没有权限用户创建', {code: 100004});

    const existed = await User.findOne({username});

    ctx.assert(!existed, 400, '用户已存在', {code: 100003});

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
    const {username, newPassword} = ctx.request.body;
    const user = await User.findOne({username});

    user.password = newPassword;

    await user.save();

    const token = getToken(_.pick(user, 'id', 'username', 'level'));

    await new Promise((resolve) => {
        setTimeout(() => {
            resolve();
            console.log('resolve');
        }, 3000);
    });

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
    ctx.assert(ctx.state.user.level !== 1, 400, '没有权限', {code: 1000001});
    const user = await User.findById(ctx.params.id);

    let update = _.pick(ctx.request.body, 'bindUpstreams', 'level', 'password');

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

