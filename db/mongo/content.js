const mongoose = require('mongoose');
const {ObjectId} = mongoose.SchemaTypes;

const content = mongoose.Schema({
    unique: {
        type: String,
        sparse: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['article', 'video']
    },
    content: {
        type: String,
        required: true
    },
    originalContent: {
        type: String,
        required: true
    },
    textualContent: {
        type: Array,
        required: true},
    tags: {
        type: [String],
        default: []
    },
    category: {
        type: String,
        required: true,
        enum: ['社会', '搞笑', '美图', '科学', '历史', '互联网', '科技', '两性', '情感', '女人', '健康', '社会', '三农', '军事', '游戏', '娱乐', '体育', '宠物', '家居', '时尚', '育儿', '美食', '旅游', '汽车', '生活', '其他']
    },
    author: {
        type: ObjectId,
        ref: 'user'
    },
    owner: {
        type: ObjectId,
        ref: 'user'
    },
    redactor: ObjectId
}, {
    timestamps: true
});

content.index({createdAt: -1});
content.index({author: 1, createdAt: -1});
content.index({tags: 1, category: -1});

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
