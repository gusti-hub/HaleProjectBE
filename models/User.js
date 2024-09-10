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
  title: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  imageUrl: { type: String }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
