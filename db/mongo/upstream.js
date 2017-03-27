const hash = require('utils/hash');
const mongoose = require('mongoose');
const {ObjectId} = mongoose.SchemaTypes;

const schema = mongoose.Schema({
    platform: {
        type: String,
        required: true
    },
    account: {
        type: String,
        required: true
    },
    remark: String,
    password: String,
    nickname: String,
    custom: String,
    session: Array,
    creater: ObjectId
}, {
    timestamps: true
});

schema.index({account: 1, platform: 1});

schema.pre('save', function (next) {
    this.set('_id', mongoose.Types.ObjectId(hash(this.platform + ':' + this.account).slice(0, 12)));
    next();
});

module.exports = mongoose.model('upstream', schema);
