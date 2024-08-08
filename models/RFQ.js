const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
    },
    vendor: {
        type: String,
        required: true,
    },
    curr: {
        type: String,
        required: true,
    },
    deadline: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "Sent RFQ"
    },
    products: [{
        productId: {type: String},
        qty: {type: Number},
        price: {type: Number}
    }]
}, { timestamps: true });

const RFQs = mongoose.model('RFQs', rfqSchema);

module.exports = RFQs;