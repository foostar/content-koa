const Upstream = require('db/mongo/upstream');
// const hash = require('utils/hash');
const _ = require('lodash');

const FIELDS = ['id', 'platform', 'nickname', 'custom', 'password', 'account', 'session', 'creater', 'createdAt', 'updatedAt'];

function escapeRegExp (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'); // eslint-disable-line
}

exports.list = async (ctx, next) => {
    let options = {limit: 5, skip: 0};
    if (ctx.query.limit) options.limit = Math.min(parseInt(ctx.query.limit), 100) || 5;
    if (ctx.query.skip) options.skip = parseInt(ctx.query.skip) || 0;

    const query = {};
    if (ctx.query.account) query.account = new RegExp('^' + escapeRegExp(ctx.query.account), 'i');
    if (ctx.query.platform) query.platform = ctx.query.platform;
    const count = await Upstream.count(query);
    const result = await Upstream.find(query, null, query);

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: {
            skip: options.skip,
            count,
            upstreams: result.map(x => _.pick(x, FIELDS))
        }
    };
};

exports.create = async (ctx, next) => {
    const {platform, account, password, cookies, nickname, custom} = ctx.request.body;
    let ups = await Upstream.findOne({account, platform});

    if (ups) {
        _.merge(
            ups,
            _.omit({password, cookies, nickname, custom})
        );
        await ups.save();
    } else {
        ups = new Upstream(ctx.request.body);
        ups.creater = ctx.state.user.id;
        await ups.save();
    }

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: {id: ups.id}
    };
};

exports.show = async (ctx, next) => {
    const ups = await Upstream.findById(ctx.params.id);
    if (!ups) {
        ctx.status = 404;
        throw Error(30404);
    }
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(ups, FIELDS)
    };
};

exports.update = async (ctx, next) => {
    const ups = await Upstream.findById(ctx.params.id);
    if (!ups) {
        ctx.status = 404;
        throw Error(30404);
    }

    if (ctx.request.body.session) {
        ups.session = ctx.request.body.session;
        await ups.save();
    }

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(ups, FIELDS)
    };
};

exports.destroy = async (ctx, next) => {
    const ups = await Upstream.findById(ctx.params.id);
    if (!ups) {
        ctx.status = 404;
        throw Error(30404);
    }
    await ups.remove();
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: {}
    };
};
