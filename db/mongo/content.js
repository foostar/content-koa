const mongoose = require('mongoose');
const {ObjectId} = mongoose.SchemaTypes;

const content = mongoose.Schema({
    title: { type: String},
    type: {type:String, required: true, enum: ['article', 'video']},
    content: {type: String, required: true},
    tag: {type:[String], default: []},
    category: {type: String, required: true},
    author: {type: ObjectId},
    redactor: ObjectId
}, {
    timestamps: true
});
content.index({ author: 1, createdAt: -1 })

module.exports = mongoose.model('content', content);
