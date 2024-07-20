const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
    },
    secname: {
        type: String,
        required: true,
    },

});

const Sections = mongoose.model('Section', sectionSchema);

module.exports = Sections;