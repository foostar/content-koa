const mongoose = require('mongoose');
const {ObjectId} = mongoose.SchemaTypes;

const content = mongoose.Schema({
    title: {
        type: String,
        unique: true
    },
    tag: String,
    content: String,
    category: String,
    author: {type: ObjectId, index: true},
    redactor: ObjectId
}, {
    timestamp: true
});

module.exports = mongoose.model('content', content);
