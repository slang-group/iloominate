// load node modules
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

// connect to MongoDB for user account support
var User = require('./models/user');
mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGODB_URI || 'localhost');
require('./config/passport')(passport);

// configure Express.js framework
var app = express();
app.configure(function () {
  app.use(express.compress());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: process.env.SECRET }));

  // avoid CSRF attack / errors
  app.use(express.csrf());
  app.use(function (req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    res.locals.token = req.csrfToken();
    next();
  });

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express["static"](__dirname + '/static'));
  app.use(express["static"](__dirname + '/lib'));
});

// helper function to check whether someone has logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// routes
var routes = require('./routes');

// homepage and editor pages
app.get('/', routes.home);
app.get('/edit', routes.editor);

// book pages
app.get('/book/:book_id', routes.books.byid);
app.post('/book', routes.books.save);

// word lists
app.get('/wordlist/all', routes.wordlists.all);
app.get('/wordlist/inteam', routes.wordlists.inteam);
app.get('/wordlist/:id', routes.wordlists.byid);
app.post('/wordlist', routes.wordlists.save);

// image editor
app.get('/image/new', routes.images.create);
app.get('/image/all', routes.images.all);
app.get('/image/inteam', routes.images.inteam);
app.get('/image/:id', routes.images.byid);
app.post('/image', routes.images.save);

// user pages
app.get('/signup', routes.users.signup);
app.get('/login', routes.users.login);
app.get('/logout', routes.users.logout);
app.get('/profile', isLoggedIn, routes.users.profile);
app.get('/user/:id', routes.users.byid);

app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));

app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

// team pages
app.post('/team/create', routes.teams.create);
app.post('/team/join', routes.teams.join);
app.get('/team/:name', routes.teams.byname);
app.get('/team/:name/manage', routes.teams.manage);

app.listen(process.env.PORT || 3000);
module.exports = app;
