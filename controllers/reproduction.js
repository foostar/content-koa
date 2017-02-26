const Reproduction = require('db/mongo/reproduction');
const mongoose = require('mongoose');
const _ = require('lodash');
const FIELDS = ['id', 'upstream', 'content', 'publishAt', 'view', 'custom', 'createdAt', 'updatedAt'];
const GROUP_FIELDS = {upstream: '$upstream', content: '$upstream'};

function makeCondition (arg) {
    let condition = {};
    if (arg.publishStart || arg.publishEnd) {
        condition['publishAt'] = {};
        if (arg.publishStart) condition['publishAt']['$gte'] = arg.publishStart;
        if (arg.publishEnd) condition['publishAt']['$le'] = arg.publishEnd;
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
    if (!reprod) {
        ctx.status = 404;
        throw Error(40404);
    }
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(reprod, FIELDS)
    };
};

exports.upsert = async (ctx, next) => {
    let reprod = await Reproduction.findById(ctx.params.id);
    if (!reprod) {
        reprod = new Reproduction(ctx.request.body);
        reprod._id = ctx.params.id;
    } else {
        _.assign(reprod, _.pick('upstream', 'content', 'publishAt', 'view'));
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
