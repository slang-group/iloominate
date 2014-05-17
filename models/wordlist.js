var mongoose = require('mongoose');

var wordListSchema = mongoose.Schema({
  name: String,
  details: String,
  words: Array
});

module.exports = mongoose.model('WordList', wordListSchema);