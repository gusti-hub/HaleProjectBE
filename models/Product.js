const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    name: { type: String, required: false },
    body: { type: String, required: false },
}, { timestamps: true });

const moreDetailsSchema = new mongoose.Schema({
    name: { type: String, required: false },
});

const productSchema = new mongoose.Schema({
    projectId: {
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
    productDetails: [moreDetailsSchema],
    comments: [commentSchema]
}, { timestamps: true });

const Products = mongoose.model('Products', productSchema);

module.exports = Products;
