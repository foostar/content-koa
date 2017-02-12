const mongoose = require('mongoose');
const {ObjectId} = mongoose.SchemaTypes;

const content = mongoose.Schema({
    title: {
        type: String,
        unique: true
    },
    tag: String,
    content: String,
    author: ObjectId,
    redactor: ObjectId
}, {
    timestamp: true
});

module.exports = mongoose.model('content', content);
