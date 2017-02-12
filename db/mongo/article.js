const mongoose = require('mongoose');
const {ObjectId} = mongoose.SchemaTypes;

const article = mongoose.Schema({
    title: {
        type: String,
        unique: true
    },
    content: String,
    tag: String,
    author: ObjectId,
    redactor: ObjectId
}, {
    timestamp: true
});

module.exports = mongoose.model('article', article);
