const mongoose = require('mongoose');

const timeExpensesSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const TimeExpenses = mongoose.model('TimeExpenses', timeExpensesSchema);

module.exports = TimeExpenses;
