const mongoose = require('mongoose');
const {ObjectId} = mongoose.SchemaTypes;

const content = mongoose.Schema({
    title: {type: String},
    type: {type: String, required: true, enum: ['article', 'video']},
    content: {type: String, required: true},
    textualContent: {type: String, required: true},
    tags: {type: [String], default: []},
    category: {type: String, required: true},
    author: {type: ObjectId},
    redactor: ObjectId
}, {
    timestamps: true
});
content.index({ author: 1, createdAt: -1 });
content.index({ tags: 1, category: -1 });
// createIndex(
//    {
//      content: "text",
//      title: "text"
//    },
//    {
//      weights: {
//        title: 10,
//        content: 5
//     },
//         name: "TextIndex"
//    }
//  )

module.exports = mongoose.model('content', content);
