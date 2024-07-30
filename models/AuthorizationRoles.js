const mongoose = require('mongoose');

const authorizationRoleSchema = new mongoose.Schema({
  
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

action_id: {
    type: String,
    required: true,
  },

action_name: {
    type: String,
    required: true,
  }, 
});



const AuthorizationRoles = mongoose.model('authorization_roles', authorizationRoleSchema);

module.exports = AuthorizationRoles;
