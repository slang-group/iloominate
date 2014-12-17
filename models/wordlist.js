var mongoose = require('mongoose');

var wordListSchema = mongoose.Schema({
  name: String,
  details: String,
  words: Array,
  hash: String,
  user: String,
  grader: String,
  place: String
});

module.exports = mongoose.model('WordList', wordListSchema);
