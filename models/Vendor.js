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
    required: false,
    unique: true,
  },
  pic: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  street: {
    type: String,
    required: false,
  }, 
  city: {
    type: String,
    required: false,
  },    
  state: {
    type: String,
    required: false,
  }, 
  zip: {
    type: String,
    required: false,
  },  
  note: {
    type: String,
    required: false,
  },          
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
