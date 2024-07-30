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
  role_id: {
    type: String,
    required: true,
  },
  role_code: {
    type: String,
    required: true,
  },
  role_name: {
    type: String,
    required: true,
  },
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
