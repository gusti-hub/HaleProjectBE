const mongoose = require('mongoose');

const inpdtsSchema = new mongoose.Schema({
    productID: {
        type: String,
        required: true,
    },
    totQty: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const InPdts = mongoose.model('InPdts', inpdtsSchema);

module.exports = InPdts;