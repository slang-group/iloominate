var User = require('../models/user');
var Book = require('../models/book');

var t = require('../static/translations');

// user login and signup requests
exports.login = function (req, res) {
  res.render('login', {
    message: req.flash('loginMessage'),
    translations: t.getTranslations(req)
  });
};

exports.signup = function (req, res) {
  res.render('signup', {
    message: req.flash('signupMessage'),
    translations: t.getTranslations(req)
  });
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};

// personal profile (only works when logged in)
exports.profile = function (req, res) {
  res.render('profile', {
    user: req.user,
    translations: t.getTranslations(req)
  });
};

// user page (works for all web visitors)
exports.byid = function (req, res) {
  User.findById(req.params.id, function (err, viewUser) {
    Book.find({ user_id: req.params.id }, function (err, books) {
      res.render('user', {
        books: books,
        translations: t.getTranslations(req),
        user: viewUser
      });
    });
  });
};
