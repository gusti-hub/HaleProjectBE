const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const Role = mongoose.model('configuration', configurationSchema);

module.exports = Role;
