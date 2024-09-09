const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
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
  role: {
    type: String,
    required: true,
  },
  imageUrl: { type: String }
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
