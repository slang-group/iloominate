var mongoose = require('mongoose');

var bookSchema = mongoose.Schema({
  name: String,
  user_id: String,
  layout: {
    font: {
      name: String,
      size: Number
    },
    wordSpace: Number,
    lineSpace: Number,
    pageWords: Number,
    sentenceWords: Number
  },
  pages: Array
});

module.exports = mongoose.model('Book', bookSchema);
