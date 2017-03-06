const mongoose = require('mongoose');
const {ObjectId, Mixed} = mongoose.SchemaTypes;

const schema = mongoose.Schema({
    link: {
        type: String,
        required: true
    },
    title: String,
    status: String,
    upstream: {type: ObjectId, required: true},
    content: ObjectId,
    publisher: ObjectId,
    author: ObjectId,
    publishAt: {type: Date, default: Date.now},
    date: {type: String, required: true}, // YYYYMMDD
    view: {type: Number, default: 0},
    custom: Mixed
}, {
    timestamps: true
});

schema.index({link: 1, date: -1}, {unique: true});
// schema.index({upstream: 1, publishAt: 1, updatedAt: -1});
// schema.index({publishAt: 1, updatedAt: -1});

module.exports = mongoose.model('reproduction', schema);
