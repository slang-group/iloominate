var mongoose = require('mongoose');

var templateSchema = mongoose.Schema({
  name: String,
  editor: String,
  team: String,
  font: {
    name: String,
    size: Number,
    wordSpace: Number,
    lineSpace: Number
  },
  pageWords: Number,
  sentenceWords: Number,
  layout: Object
});

module.exports = mongoose.model('Template', templateSchema);
