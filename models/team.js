var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var teamSchema = mongoose.Schema({
  name: String,
  users: Array,
  admin: String,
  language: String,
  local: {
    email: String,
    password: String
  }
});

teamSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

teamSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('Team', teamSchema);
