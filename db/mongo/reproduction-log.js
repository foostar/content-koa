const mongoose = require('mongoose');

const schema = mongoose.Schema({
    reproduction: String,
    view: {type: Number, default: 0},
    version: {type: Number, default: 0}
}, {
    timestamps: true
});

schema.index({reproduction: 1, updatedAt: -1});

module.exports = mongoose.model('reproduction-log', schema);
