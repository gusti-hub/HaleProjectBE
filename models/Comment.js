const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const Comments = mongoose.model('Comment', commentSchema);

module.exports = Comments;
