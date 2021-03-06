const Content = require('db/mongo/content');
const User = require('db/mongo/user');
const Reproduction = require('db/mongo/reproduction');
const htmlToText = require('html-to-text');
const nodejieba = require('nodejieba');

const _ = require('lodash');

const CONTENT_FIELDS = ['id', 'type', 'title', 'content', 'originalContent', 'tags', 'category', 'author', 'owner', 'redactor', 'createdAt', 'updatedAt'];

function escapeRegExp (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'); // eslint-disable-line
}

exports.create = async (ctx, next) => {
    const con = _.extend({}, ctx.request.body, {author: ctx.state.user.id});
    let tags = con.tags || [];
    tags.push(ctx.state.user.level === 1 ? '精品' : '原创');
    con.tags = tags;
    con.originalContent = con.content;
    if (con.type === 'article') {
        con.textualContent = nodejieba.cut(htmlToText.fromString(con.content), true).join(' ');
    }
    try {
        const content = await new Content(con).save();
        ctx.body = {
            status: {
                code: 0,
                message: 'success'
            },
            data: {id: content.id}
        };
    } catch (err) {
        ctx.throw(400, '创建文章错误', {code: 101003});
    }
};

exports.list = async (ctx, next) => {
    let options = {limit: 5, skip: 0};
    if (ctx.query.limit) options.limit = Math.min(parseInt(ctx.query.limit), 100) || 5;
    if (ctx.query.skip) options.skip = parseInt(ctx.query.skip) || 0;

    let returnFields = ['id', 'type', 'tags', 'title', 'category', 'createdAt', 'updatedAt'];
    if (ctx.query.fields) {
        const fields = _.isArray(ctx.query.fields) ? ctx.query.fields : [ctx.query.fields];
        returnFields = _.intersection(fields, CONTENT_FIELDS);
    }

    const count = await Content.count({author: ctx.state.user.id});
    let contents = await Content.find({author: ctx.state.user.id}, returnFields.join(' '), options).sort({createdAt: -1});
    contents = contents.map(x => _.pick(x, returnFields));
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: {
            skip: options.skip,
            count,
            contents
        }
    };
};

exports.show = async (ctx, next) => {
    let con = await Content.findById(ctx.params.id);
    ctx.assert(con, 404, '没有该文章', {code: 101001});
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(con, CONTENT_FIELDS)
    };
};

// verify for update
async function verifyAndFindOne (ctx, id) {
    let con = await Content.findById(id);
    ctx.assert(con, 404, '没有该文章', {code: 101001});

    const userLevel = ctx.state.user.level;

    ctx.assert(
        `${con.author}` === ctx.state.user.id || userLevel === 2 || userLevel === 0,
        '400',
        '没有修改此文章的权限',
        {code: 101002}
    );

    ctx.assert(
        !con.owner || `${con.owner}` === ctx.state.user.id,
        '400',
        '文章被锁定',
        {code: 101003}
    );

    return con;
}

exports.acquire = async (ctx, next) => {
    let con = await verifyAndFindOne(ctx, ctx.params.id);

    con.owner = ctx.state.user.id;
    con = await con.save();

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(con, CONTENT_FIELDS)
    };
};

exports.release = async (ctx, next) => {
    let con = await verifyAndFindOne(ctx, ctx.params.id);

    con.owner = null;
    con = await con.save();

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(con, CONTENT_FIELDS)
    };
};

exports.update = async (ctx, next) => {
    let con = await verifyAndFindOne(ctx, ctx.params.id);

    let update = _.pick(ctx.request.body, 'title', 'content', 'category');
    if (con.type === 'article' && update.content) {
        update.textualContent = nodejieba.cut(htmlToText.fromString(update.content), true).join(' ');
    }
    _.assign(con, update);

    con = await con.save();
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(con, CONTENT_FIELDS)
    };
};

exports.remove = async (ctx, next) => {
    let con = await verifyAndFindOne(ctx, ctx.params.id);

    let nreprod = await Reproduction.count({content: con.id});
    ctx.assert(nreprod === 0, 409, '文章已被发布，不能删除', {code: 101004});
    await con.remove();
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(con, CONTENT_FIELDS)
    };
};

let commonTags = [];
function updateTag (latest) {
    let m = _.pull(commonTags, latest);
    m.unshift(latest);
    if (m.lenght > 100) m.pop();
    commonTags = m;
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
    await verifyAndFindOne(ctx, ctx.params.id);

    const update = {$set: {redactor: ctx.state.user.id}, $addToSet: {'tags': ctx.params.tag}};
    let con = await Content.findByIdAndUpdate(ctx.params.id, update, {new: true});
    ctx.assert(con, 404, '没有该文章', {code: 101001});

    updateTag(ctx.params.tag);

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(con, 'id', 'tags')
    };
};

exports.removeTag = async (ctx, next) => {
    await verifyAndFindOne(ctx, ctx.params.id);

    const update = {$set: {redactor: ctx.state.user.id}, $pull: {tags: ctx.params.tag}};
    let con = await Content.findByIdAndUpdate(ctx.params.id, update, {new: true});
    ctx.assert(con, 404, '没有该文章', {code: 101001});

    updateTag(ctx.params.tag);
    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: _.pick(con, 'id', 'tags')
    };
};

exports.search = async (ctx, next) => {
    const userLevel = ctx.state.user.level;
    ctx.assert(
        userLevel === 0 || userLevel === 2,
        400,
        '没有搜索文章的权限',
        {code: 101002}
    );

    const options = {limit: 5, skip: 0, populate: 'author'};
    if (ctx.query.limit) options.limit = Math.min(parseInt(ctx.query.limit), 100) || 5;
    if (ctx.query.skip) options.skip = parseInt(ctx.query.skip) || 0;

    let returnFields = ['id', 'type', 'author', 'tags', 'title', 'category', 'createdAt', 'updatedAt'];
    if (ctx.query.fields) {
        const fields = _.isArray(ctx.query.fields) ? ctx.query.fields : [ctx.query.fields];
        returnFields = _.intersection(fields, CONTENT_FIELDS);
    }

    const condition = {};
    if (ctx.query.includeTags) {
        const includeTags = _.isArray(ctx.query.includeTags) ? ctx.query.includeTags : [ctx.query.includeTags];
        condition.tags = {$all: includeTags};
    }
    if (ctx.query.excludeTags) {
        const excludeTags = _.isArray(ctx.query.excludeTags) ? ctx.query.excludeTags : [ctx.query.excludeTags];
        if (!condition.tags) {
            condition.tags = {'$nin': excludeTags};
        } else {
            condition.$and = [{tags: condition.tags}, {tags: {'$nin': excludeTags}}];
            delete condition.tags;
        }
    }

    if (ctx.query.category) condition['category'] = ctx.query.category;
    if (ctx.query.author) {
        const author = await User.findOne({username: ctx.query.author});
        condition.author = author._id;
    };

    if (ctx.query.keyword) condition['textualContent'] = new RegExp(escapeRegExp(nodejieba.cut(ctx.query.keyword, true).join(' ')), 'im');

    const count = await Content.count(condition);
    let contents = await Content.find(condition, returnFields.join(' '), options).sort({createdAt: -1});
    contents = contents.map(x => _.pick(x, returnFields));

    ctx.body = {
        status: {
            code: 0,
            message: 'success'
        },
        data: {
            skip: options.skip,
            count,
            contents
        }
    };
};
