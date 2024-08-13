const mongoose = require('mongoose');

const poSchema = new mongoose.Schema({
    poId: {
        type: String,
        required: true,
    },
    projectId: {
        type: String,
        required: true,
    },
    rfq: {
        type: String,
        required: true,
    },
    vendor: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: String,
        required: true,
    },
    delivery: {
        type: String,
        required: true,
    },
    receive: {
        type: String,
        required: true,
    },
    products: [{
        productId: {type: String},
    }]
}, { timestamps: true });

const POs = mongoose.model('POs', poSchema);

module.exports = POs;