var mongoose = require('mongoose');

var imageSchema = mongoose.Schema({
  name: String,
  user: String,
  upload: String,
  icons: Array
});

module.exports = mongoose.model('Imager', imageSchema);
