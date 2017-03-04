const Reproduction = require('db/mongo/reproduction');
const mongoose = require('mongoose');
const _ = require('lodash');
const FIELDS = ['id', 'upstream', 'publisher', 'content', 'publishAt', 'view', 'custom', 'createdAt', 'updatedAt'];
const GROUP_FIELDS = {upstream: '$upstream', content: '$upstream', publisher: '$publisher'};

function makeCondition (arg) {
    let condition = {};
    if (arg.publishStart || arg.publishEnd) {
        condition['publishAt'] = {};
        if (arg.publishStart) condition['publishAt']['$gte'] = new Date(arg.publishStart);
        if (arg.publishEnd) condition['publishAt']['$le'] = new Date(arg.publishEnd);
    }

    if (arg.upstreams) {
        const upstreams = _.isArray(arg.upstreams) ? arg.upstreams : [arg.upstreams];
        condition['upstream'] = {'$in': upstreams.map(mongoose.Types.ObjectId)};
    }

    if (arg.contents) {
        const contents = _.isArray(arg.contents) ? arg.contents : [arg.contents];
        condition['content'] = {'$in': contents.map(mongoose.Types.ObjectId)};
    }
    return condition;
}

exports.stat = async (ctx, next) => {
    const groupBy = GROUP_FIELDS[ctx.query.groupBy] ? ctx.query.groupBy : null;
    const expression = GROUP_FIELDS[ctx.query.groupBy] || null;
    const project = {_id: 0, total: 1, lastUpdate: 1};
    if (groupBy) project[groupBy] = '$_id';

    const pipeline = [
        {'$match': makeCondition(ctx.query)},
        {'$group': {_id: expression, total: {'$sum': '$view'}, lastUpdate: {'$max': '$updatedAt'}}},
        {'$project': project}
    ];
    const result = await Reproduction.aggregate(pipeline);
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: result
    };
};

exports.list = async (ctx, next) => {
    let options = {limit: 5, skip: 0};
    if (ctx.query.limit) options.limit = Math.min(parseInt(ctx.query.limit), 100) || 5;
    if (ctx.query.skip) options.skip = parseInt(ctx.query.skip) || 0;

    const condition = makeCondition(ctx.query);
    const count = await Reproduction.count(condition);
    let reprods = await Reproduction.find(condition, null, options).sort({updatedAt: -1});
    reprods = reprods.map(x => _.pick(x, FIELDS));
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: {
            skip: options.skip,
            count,
            reproductions: reprods
        }
    };
};

exports.show = async (ctx, next) => {
    let reprod = await Reproduction.findById(ctx.params.id);
    ctx.assert(reprod, 404, '没有该记录', {code: 103001});
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(reprod, FIELDS)
    };
};

exports.upsert = async (ctx, next) => {
    const publisher = ctx.state.user.id;
    let reprod = await Reproduction.findById(ctx.params.id);
    if (!reprod) {
        reprod = new Reproduction(Object.assign({}, ctx.request.body, {publisher}));
        reprod._id = ctx.params.id;
    } else {
        _.assign(reprod, _.pick('upstream', 'content', 'publishAt'));
    }
    await reprod.save();
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(reprod, FIELDS)
    };
};

exports.update = async (ctx, next) => {
    const {data} = ctx.request.body;
    ctx.assert(Array.isArray(data), 400, 'data 不是数组');

    const update = async (item) => {
        const {id, view, upstream} = item;
        await Reproduction.update(
            {_id: id},
            _.omitBy({view, upstream}, _.isNil),
            {upsert: true}
        );
    };

    try {
        await Promise.all(data.map(update));
    } catch (err) {
        ctx.throw(err);
    }

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        }
    };
};
