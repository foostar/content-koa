const Content = require('db/mongo/content');
const mongoose = require('mongoose')
const _ = require ('lodash')

const CONTENT_FIELDS = ["id", "type", "title", "content", "tag", "category", "author", "redactor", "createdAt", "updatedAt"]

exports.create = async (ctx, next) => {
    const con  = _.extend({}, ctx.request.body, {author: ctx.state.user.id});
    const content = new Content(con);
    const doc = await content.save();
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: {id: doc.id}
    }
};


exports.list = async (ctx, next) => {
    let options = {limit:5, skip:0};
    if (ctx.query.limit) options.limit = Math.min(parseInt(ctx.query.limit), 100) || 5;
    if (ctx.query.skip) options.skip = parseInt(ctx.query.skip) || 0;

    let returnFields = ["id", "type", "title", "category", "createdAt", "updatedAt"];
    if (ctx.query.fields) {
        const fields = _.isArray(ctx.query.fields) ? ctx.query.fields : [ctx.query.fields];
        returnFields = _.intersection(fields, CONTENT_FIELDS);
    }

    const count = await Content.count({author: ctx.state.user.id});
    let contents = await Content.find({author: ctx.state.user.id}, returnFields.join(' '), options).sort({createdAt: -1});
    contents = contents.map(x =>  _.pick(x, returnFields));
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: {
            skip:options.skip,
            count,
            contents
        }
    };
};

exports.show = async (ctx, next) => {
    let con = await Content.findById(ctx.params.id);
    if (!con){ 
        ctx.status = 404;
        throw Error(20404);
    } 
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(con, CONTENT_FIELDS)
    };
};

exports.update = async (ctx, next) => {
    let con = await Content.findById(ctx.params.id);
    if (!con){ 
        ctx.status = 500;
        throw Error(20404);
    }

    if (con.author.toString() !== ctx.state.user.id && ctx.state.user.level !== 0) {
        ctx.status = 403;
        throw Error(20403);
    }

    _.assign(con, _.pick(ctx.request.body, "title", "content",  "category"))
    con = await con.save()
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(con, CONTENT_FIELDS)
    };
};

var commonTags = [];
function updateTag(latest) {
    let m = _.pull(commonTags, latest)
    m.unshift(latest)
    if (m.lenght > 100) m.pop()
    commonTags = m
}

exports.listCommonTags = async (ctx, next) => {
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: {
            tags: commonTags.slice(0, 20)
        }
    };
};

exports.addTag = async (ctx, next) => {
    if (ctx.state.user.level !== 0) {
        ctx.status = 403;
        throw Error(20403);
    }

    const update = {'$set': {'redactor': ctx.state.user.id}, '$addToSet':{'tag': ctx.params.tag}};
    let con = await Content.findByIdAndUpdate(ctx.params.id, update, {new:true});
    if (!con){ 
        ctx.status = 404;
        throw Error(20404);
    }
    
    updateTag(ctx.params.tag)

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(con, 'id', 'tag')
    };
};


exports.removeTag = async (ctx, next) => {
    if (ctx.state.user.level !== 0) {
        ctx.status = 403;
        throw Error(20403);
    }

    const update = {'$set': {'redactor': ctx.state.user.id}, '$pull':{'tag': ctx.params.tag}};
    let con = await Content.findByIdAndUpdate(ctx.params.id, update, {new:true});
    if (!con){ 
        ctx.status = 404;
        throw Error(20404);
    }
 
    updateTag(ctx.params.tag)
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(con, 'id', 'tag')
    };
}
