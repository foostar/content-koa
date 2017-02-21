const hash = require('utils/hash');
const mongoose = require('mongoose');
const {ObjectId} = mongoose.SchemaTypes;

const user = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        set: v => hash(v)
    },
    level: {
        // 0: admin
        // 1: author
        // 2: redactor
        type: Number,
        default: 1
    },
    bindUpstreams: [ObjectId]
}, {
    timestamps: true
});

// user.pre('save', async function (next) {
//     if (!this.isNew) return next();

//     this.id = await module.exports.count() + 1;
//     next();
// });

module.exports = mongoose.model('user', user);
