var mongoose = require('mongoose');

var templateSchema = mongoose.Schema({
  name: String,
  user_id: String,
  team: String,
  layout: {
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
    sentenceWords: Number
  }
});

module.exports = mongoose.model('Template', templateSchema);
