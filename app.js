// load node modules
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

// load all translations
var allTranslations = require('./static/translations').translations;

// connect to MongoDB for user account support
var User = require('./models/user');
var Book = require('./models/book');
mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGODB_URI || 'localhost');
require('./config/passport')(passport);

// configure Express.js framework
var app = express();
app.configure(function(){
  app.use(express.compress());
  
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: process.env.SECRET }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.static(__dirname + '/static'));
  app.use(express.static(__dirname + '/lib'));
});

app.get('/', function(req, res){
  res.render('index', {
    translations: getTranslations(req)
  });
});

// user login and signup requests
app.get('/login', function(req, res){
  res.render('login', {
    message: req.flash('loginMessage'),
    translations: getTranslations(req)
  });
});

app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/signup', function(req, res){
  res.render('signup', {
    message: req.flash('signupMessage'),
    translations: getTranslations(req)
  });
});

app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// personal profile (only works when logged in)
app.get('/profile', isLoggedIn, function(req, res){
  res.render('profile', {
    user: req.user,
    translations: getTranslations(req)
  });
});

// user page (works for all web visitors)
app.get('/user/:id', function(req, res){
  User.findById(req.params.id, function(err, viewUser){
    Book.find({ user_id: req.params.id }, function(err, books){
      res.render('user', {
        books: books,
        translations: getTranslations(req),
        user: viewUser
      });
    });
  });
});

// book pages (view and post)
app.post('/book', function(req, res){
  var book;
  if(req.body.book_id){
    Book.findById(req.body.book_id, function(err, book){
      book.pages = req.body.pages;
      book.save(function(err){
        res.json({ id: book._id });
      });
    });
  }
  else{
    var book = new Book();
    book.name = "hello";
    book.user_id = "536e934decbddf2809fa32a0";
    book.pages = req.body.pages;
    book.save(function(err){
      res.json({ id: book._id });
    });
  }
});

// helper function to return standard or requested translations from server
function getTranslations(req){
  // detect language on server side, return translations
  var preferredLocale = req.query.language || req.headers['accept-language'].split(",")[0];
  if(!allTranslations[preferredLocale]){
    // check if there is a match for the root locale (es_uy -> es)
    preferredLocale = preferredLocale.split("_")[0];
    if(!allTranslations[preferredLocale]){
      // default (en)
      preferredLocale = "en";
    }
  }
  return JSON.stringify( allTranslations[preferredLocale] );
}

// helper function to check whether someone has logged in
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/');
  }
}

app.listen(process.env.PORT || 3000);