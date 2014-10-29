var cradle = require('cradle');

var t = require('../static/translations');

var db = new(cradle.Connection)().database('books');
var template_db = new(cradle.Connection)().database('templates');

exports.home = function (req, res) {
  res.render('home', {
    translations: t.getTranslations(req, res),
    loggedin: false // req.isAuthenticated()
  });
};

exports.maker = function (req, res) {
  if(req.query.id) {
    // editing layout of book? not currently supported
  } else {
    if(req.user) {
      template_db.get('unknown', function(err, templates) { // .select('name')
        if(err) {
          throw err;
        }
        res.render('make', {
          translations: t.getTranslations(req, res),
          loggedin: false, //req.isAuthenticated(),
          templates: templates,
          book: null
        });
      });
    } else {
      res.render('make', {
        translations: t.getTranslations(req, res),
        loggedin: false, //req.isAuthenticated(),
        book: null
      });
    }
  }
};

exports.editor = function (req, res) {
  if(req.query.id) {
    db.get(req.query.id, function (err, book) {
      if (err) {
        return res.json(err);
      }
      res.render('editor', {
        translations: t.getTranslations(req, res),
        loggedin: false, // req.isAuthenticated(),
        book: book
      });
    });
  } else {
    res.render('editor', {
      translations: t.getTranslations(req, res),
      loggedin: false, // req.isAuthenticated(),
      book: null
    });
  }
};

exports.users = require('./users');
exports.teams = require('./teams');
exports.books = require('./books');
exports.wordlists = require('./wordlists');
exports.images = require('./images');
exports.templates = require('./templates');
