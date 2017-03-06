const Reproduction = require('db/mongo/reproduction');
const mongoose = require('mongoose');
const _ = require('lodash');
const moment = require('moment');

const FIELDS = ['link', 'upstream', 'publisher', 'content', 'date', 'publishAt', 'view', 'custom', 'createdAt', 'updatedAt'];
const GROUP_FIELDS = {upstream: '$upstream', content: '$upstream', publisher: '$publisher', link: '$link', date: '$date'};

function makeCondition (arg) {
    let condition = {};
    if (arg.publishStart || arg.publishEnd) {
        condition['publishAt'] = {};
        if (arg.publishStart) condition['publishAt']['$gte'] = new Date(Number(arg.publishStart));
        if (arg.publishEnd) condition['publishAt']['$lt'] = new Date(Number(arg.publishEnd));
    }

    if (arg.dateStart || arg.dateStart) {
        condition['date'] = {};
        if (arg.dateStart) condition['date']['$gte'] = new Date(arg.dateStart);
        if (arg.dateStart) condition['date']['$lt'] = new Date(arg.dateStart);
    }

    if (arg.links) {
        const links = _.isArray(arg.links) ? arg.links : [arg.links];
        condition['link'] = {'$in': links.map(mongoose.Types.ObjectId)};
    }

    if (arg.upstreams) {
        const upstreams = _.isArray(arg.upstreams) ? arg.upstreams : [arg.upstreams];
        condition['upstream'] = {'$in': upstreams.map(mongoose.Types.ObjectId)};
    }

    if (arg.contents) {
        const contents = _.isArray(arg.contents) ? arg.contents : [arg.contents];
        condition['content'] = {'$in': contents.map(mongoose.Types.ObjectId)};
    }

    if (arg.publishers) {
        const publishers = _.isArray(arg.publishers) ? arg.publishers : [arg.publishers];
        condition['publisher'] = {'$in': publishers.map(mongoose.Types.ObjectId)};
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
    let reprods = await Reproduction.find(condition, null, options).sort({date: -1});
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

const upsertOne = async function (curUser, item) {
    item.date = moment(item.date).format('YYYYMMDD');
    const {link, date} = item;
    let reprod = await Reproduction.findOne({link});

    if (!reprod) {
        reprod = new Reproduction(Object.assign({publisher: curUser}, item));
        return reprod.save();
    } else {
        let data = Object.assign(_.omit(reprod.toJSON(), '_id', 'createdAt', 'updatedAt', '__v'), item);
        return Reproduction.findOneAndUpdate(
        {link, date},
        {$set: _.omit(data, 'link', 'date')},
        {upsert: true, new: true});
    }
};

exports.upsert = async (ctx, next) => {
    const item = Object.assign({}, ctx.request.body);
    const reprod = await upsertOne(ctx.state.user.id, item);

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(reprod, FIELDS)
    };
};

exports.batchUpsert = async (ctx, next) => {
    const data = ctx.request.body;
    ctx.assert(Array.isArray(data), 400, 'data 不是数组');

    try {
        await Promise.all(data.map(x => upsertOne(ctx.state.user.id, x)));
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
