const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: false,
  },
  owner: {
    type: String,
    required: true,
  },
  client: {
    type: String,
    required: true,
  },
  progress: {
    type: String,
    default: "Not Started"
  },
}, { timestamps: true });

const Sales = mongoose.model('Sales', salesSchema);

module.exports = Sales;
