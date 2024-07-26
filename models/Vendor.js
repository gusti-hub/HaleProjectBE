const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
