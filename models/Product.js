const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    name: { type: String, required: false },
    body: { type: String, required: false },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    qty: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: false,
    },
    productDetails: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: false,
    },
    comments: [commentSchema],
    imageUrl: { type: String },
    status: {
        type: String,
        default: "Pending"
    }
}, { timestamps: true });

const Products = mongoose.model('Products', productSchema);

module.exports = Products;
