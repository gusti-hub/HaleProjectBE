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
  invitedUsers: {
    type: [String],
    default: []
  },
  budget: {
    type: Number,
    default: 0,
    min: 0 
  },
  imageUrl: { type: String }
}, { timestamps: true });

salesSchema.pre('save', function(next) {
  if (this.invitedUsers.length === 0) {
    this.invitedUsers.push(this.owner);
  }
  next();
});

const Sales = mongoose.model('Sales', salesSchema);

module.exports = Sales;
