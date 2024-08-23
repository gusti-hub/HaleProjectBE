const mongoose = require('mongoose');

const outdocSchema = new mongoose.Schema({
    docNum: {
        type: String,
        required: true,
    },
    projectName: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: false,
    }
}, { timestamps: true });

const OutDocs = mongoose.model('OutDocs', outdocSchema);

module.exports = OutDocs;