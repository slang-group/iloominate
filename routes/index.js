var t = require('../static/translations');

exports.home = function (req, res) {
  res.render('index', {
    translations: t.getTranslations(req, res),
    loggedin: req.isAuthenticated()
  });
};

exports.users = require('./users');
exports.teams = require('./teams');
exports.books = require('./books');
exports.wordlists = require('./wordlists');
