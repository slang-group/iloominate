var User = require('../models/user');
var Book = require('../models/book');
var Template = require('../models/template');
var Team = require('../models/team');

var t = require('../static/translations');

// user login and signup requests
exports.login = function (req, res) {
  res.render('login', {
    message: req.flash('loginMessage'),
    translations: t.getTranslations(req, res)
  });
};

exports.signup = function (req, res) {
  res.render('signup', {
    message: req.flash('signupMessage'),
    translations: t.getTranslations(req, res)
  });
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};

// personal profile (only works when logged in)
exports.profile = function (req, res) {
  if (req.user && req.user.teams.length) {
    // select first team for now
    var teamName = req.user.teams[0];
    Team.findOne({ name: teamName }, function(err, team) {
      if (err) {
        throw err;
      }

      // select templates of all users in team
      Template.find({ 'user_id': { $in: team.users } }).select('name').exec(function(err, templates) {
        if(err) {
          throw err;
        }
        res.render('profile', {
          user: req.user,
          translations: t.getTranslations(req, res),
          templates: templates
        });
      });
    });
  } else {
    res.render('profile', {
      user: req.user,
      translations: t.getTranslations(req, res),
      templates: []
    });
  }
};

// user page (works for all web visitors)
exports.byid = function (req, res) {
  User.findById(req.params.id, function (err, viewUser) {
    if (err) {
      throw err;
    }
    Book.find({ user_id: req.params.id }, function (err, books) {
      if (err) {
        throw err;
      }
      res.render('user', {
        books: books,
        translations: t.getTranslations(req, res),
        user: viewUser
      });
    });
  });
};
