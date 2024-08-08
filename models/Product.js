const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    name: { type: String, required: false },
    body: { type: String, required: false },
}, { timestamps: true });

const moreDetailsSchema = new mongoose.Schema({
    code: { type: String, required: false }, 
    unit: { type: String, required: false }, 
    len: { type: Number, required: false }, 
    wid: { type: Number, required: false }, 
    dia: { type: Number, required: false }, 
    color: { type: String, required: false }, 
    material: { type: String, required: false }, 
    insert: { type: String, required: false }, 
    finish: { type: String, required: false }, 
    qty: { type: Number, required: false }, 
    // vendor: { type: String, required: false }, 
    // budget: { type: Number, required: false }, 
    // buyCost: { type: Number, required: false }, 
    // sellCost: { type: Number, required: false }
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
    productDetails: moreDetailsSchema,
    comments: [commentSchema],
    imageUrl: { type: String },
    status: {
        type: String,
        default: "Pending"
    },
    rfqNumber: {type: String},
    price: {type: Number},
    rfqSentDate: {type: String},
    rfqReceiveDate: {type: String}
}, { timestamps: true });

const Products = mongoose.model('Products', productSchema);

module.exports = Products;
