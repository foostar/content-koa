const mongoose = require('mongoose');
const {ObjectId, Mixed} = mongoose.SchemaTypes;

const schema = mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    title: String,
    upstream: ObjectId,
    content: ObjectId,
    publisher: ObjectId,
    publishAt: Date,
    view: {type: Number, default: 0},
    custom: Mixed
}, {
    timestamps: true,
    _id: false
});

schema.index({content: 1});
schema.index({upstream: 1, publishAt: 1, updatedAt: -1});
schema.index({publishAt: 1, updatedAt: -1});

module.exports = mongoose.model('reproduction', schema);
