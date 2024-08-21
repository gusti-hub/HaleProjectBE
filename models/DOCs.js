const mongoose = require('mongoose');

const docSchema = new mongoose.Schema({
    docNumber: {
        type: String,
        required: true,
    },
    poId: {
        type: String,
        required: true,
    },
    products: [{
        productId: { type: String },
        recQty: {type: Number},
        demQty: {type: Number}
    }],
    inStatus: {
        type: String,
        default: 'Waiting for arrival'
    }
}, { timestamps: true });

const DOCs = mongoose.model('DOCs', docSchema);

module.exports = DOCs;