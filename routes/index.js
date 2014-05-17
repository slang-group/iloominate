var t = require('../static/translations');

exports.home = function (req, res) {
  res.render('index', {
    translations: t.getTranslations(req)
  });
};

exports.users = require('./users');
exports.books = require('./books');
exports.wordlists = require('./wordlists');