var mongoose = require('mongoose');

var bookSchema = mongoose.Schema({
  name: String,
  user_id: String,
  layout: {
    cover: {
      title: String,
      author: String,
      url: String
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
    paperSize: String,
    wordSpace: Number,
    lineSpace: Number,
    pageWords: Number,
    sentenceWords: Number,
    grader: String
  },
  pages: Array
});

module.exports = mongoose.model('Book', bookSchema);
