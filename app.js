var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var allTranslations = require('./static/translations').translations;

mongoose.connect(process.env.MONGOLAB_URI);
require('./config/passport')(passport);

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
  res.render('index', {
    translations: JSON.stringify( allTranslations[preferredLocale] )
  });
});

app.get('/login', function(req, res){
  res.render('login', {
    message: req.flash('loginMessage')
  });
});

app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/signup', function(req, res){
  res.render('signup', {
    message: req.flash('signupMessage')
  });
});

app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));

app.get('/profile', isLoggedIn, function(req, res){
  res.render('profile', {
    user: req.user
  });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

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