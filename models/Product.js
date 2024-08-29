const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    name: { type: String, required: false },
    body: { type: String, required: false },
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
    name: { type: String },
    body: { type: String },
    userType: { type: String }
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
    code: {
        type: String,
        required: true,
    },
    sku: {
        type: String,
        required: false,
    },    
    furnishing: {
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
    qty: {
        type: String,
        required: true,
    },
    rfq: {
        type: String,
        required: false,
    },
    vendor: {
        type: String,
        required: false,
    },
    net_cost: {
        type: String,
        required: false,
    },
    shipping_cost: {
        type: String,
        required: false,
    },
    other_cost: {
        type: String,
        required: false,
    },
    po_amount: {
        type: String,
        required: false,
    },
    buy_tax: {
        type: String,
        required: false,
    },
    buy_sales_tax: {
        type: String,
        required: false,
    },
    sell_markup: {
        type: String,
        required: false,
    },
    client_product_cost: {
        type: String,
        required: false,
    },
    client_price: {
        type: String,
        required: false,
    },  
    sell_tax: {
        type: String,
        required: false,
    },  
    sell_sales_tax: {
        type: String,
        required: false,
    },                          
    productDetails: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: false,
    },
    comments: [commentSchema],
    chats: [chatSchema],
    imageUrl: { type: String },
    status: {
        type: String,
        default: "Waiting for Client Approval"
    },
    rfqNumber: { type: String },
    price: { type: Number },
    rfqSentDate: { type: String },
    rfqReceiveDate: { type: String },
    poNumber: { type: String },
    poSentDate: { type: String },
}, { timestamps: true });

const Products = mongoose.model('Products', productSchema);

module.exports = Products;
