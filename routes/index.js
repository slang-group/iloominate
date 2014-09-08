var t = require('../static/translations');
var Book = require('../models/book');
var Template = require('../models/template');

exports.home = function (req, res) {
  res.render('home', {
    translations: t.getTranslations(req, res),
    loggedin: req.isAuthenticated()
  });
};

exports.maker = function (req, res) {
  if(req.query.id) {
    // editing layout of book? not currently supported
  } else {
    if(req.user) {
      Template.find().select('name').exec(function(err, templates) {
        if(err) {
          throw err;
        }
        res.render('make', {
          translations: t.getTranslations(req, res),
          loggedin: req.isAuthenticated(),
          templates: templates,
          book: null
        });
      });
    } else {
      res.render('make', {
        translations: t.getTranslations(req, res),
        loggedin: req.isAuthenticated(),
        book: null
      });
    }
  }
};

exports.editor = function (req, res) {
  if(req.query.id) {
    Book.findById(req.query.id, function (err, book) {
      if (err) {
        return res.json(err);
      }
      res.render('editor', {
        translations: t.getTranslations(req, res),
        loggedin: req.isAuthenticated(),
        book: book
      });
    });
  } else {
    res.render('editor', {
      translations: t.getTranslations(req, res),
      loggedin: req.isAuthenticated(),
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
