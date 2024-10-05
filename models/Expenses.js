const mongoose = require('mongoose');

const expensesSchema = new mongoose.Schema({
    prj: { type: String, required: true },
    date: { type: String, required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    comment: { type: String, required: false, default: '' },
    imageUrl: { type: String, required: false }
}, { timestamps: true });

const Expenses = mongoose.model('Expenses', expensesSchema);

module.exports = Expenses;
