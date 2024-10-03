const mongoose = require('mongoose');

const TimeNExpenseSchema = new mongoose.Schema({
    docid: { type: String, required: true },
    teid: { type: String, required: true },
    user: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, default: 'Draft on Approval' },

}, { timestamps: true });

const TimeNExpense = mongoose.model('TimeNExpense', TimeNExpenseSchema);

module.exports = TimeNExpense;
