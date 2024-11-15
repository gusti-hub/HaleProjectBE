const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
    },
    proposalName: {
        type: String,
        required: true,
    },

});

const Proposals = mongoose.model('Proposal', proposalSchema);

module.exports = Proposals;