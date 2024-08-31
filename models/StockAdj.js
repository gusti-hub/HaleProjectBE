const mongoose = require('mongoose');

const stockAdjSchema = new mongoose.Schema({
    docNum: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: false,
    },
    products: [{
        pdtid: { type: String },
        qty: {type: Number}
    }],
}, { timestamps: true });

const StockAdjDocs = mongoose.model('StockAdjDocs', stockAdjSchema);

module.exports = StockAdjDocs;