const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: true,
  },
  address: {
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
  phone: {
    type: String,
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
  imageUrl: { type: String }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
