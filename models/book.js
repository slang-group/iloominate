var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var bookSchema = mongoose.Schema({
  name: String,
  user_id: String,
  pages: Array
});

module.exports = mongoose.model('Book', bookSchema);