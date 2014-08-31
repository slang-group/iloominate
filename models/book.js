var mongoose = require('mongoose');

var bookSchema = mongoose.Schema({
  name: String,
  user_id: String,
  layout: {
    cover: {
      title: String,
      author: String,
      url: String,
      hash: String
    },
    text: {
      top: Boolean,
      middle: Boolean,
      bottom: Boolean,
      bg: Boolean,
      span: Boolean
    },
    image: {
      top: Boolean,
      middle: Boolean,
      bottom: Boolean,
      bg: Boolean,
      span: Boolean
    },
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
