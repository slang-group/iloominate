// load node modules
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var cloudinary = require('cloudinary');
var md5 = require('MD5');

// load all translations
var allTranslations = require('./static/translations').translations;

// connect to MongoDB for user account support
var User = require('./models/user');
var Book = require('./models/book');
mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGODB_URI || 'localhost');
require('./config/passport')(passport);

// configure Express.js framework
var app = express();
app.configure(function () {
  app.use(express.compress());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: process.env.SECRET }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express["static"](__dirname + '/static'));
  app.use(express["static"](__dirname + '/lib'));
});

// helper function to return standard or requested translations from server
function getTranslations (req) {
  // detect language on server side, return translations
  var preferredLocale = req.query.language || (req.headers['accept-language'] || "").split(",")[0];
  if (!allTranslations[preferredLocale]) {
    // check if there is a match for the root locale (es_uy -> es)
    preferredLocale = preferredLocale.split("_")[0];
    if (!allTranslations[preferredLocale]) {
      // default (en)
      preferredLocale = "en";
    }
  }
  return JSON.stringify(allTranslations[preferredLocale]);
}

// helper function to check whether someone has logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// helper function to iterate through pages
function uploadPages (res, book, pages, start_index) {
  // reached end of book - return book ID
  if (start_index >= pages.length) {
    return book.save(function (err) {
      res.json({ id: book._id });
    });
  }

  var page = pages[start_index];
  if (page.image) {
    // store and update images in Cloudinary

    // create a shorter hash to notice when images change
    var hash = "";
    if (page.image) {
      try {
        hash = md5(page.image+"")+"";
      }
      catch(e) {
        hash = md5.digest_s(page.image+"")+"";
      }
    }

    if (!book.pages[start_index].hash || book.pages[start_index].hash !== hash) {
      // upload this new or updated image
      return cloudinary.uploader.upload(page.image, function (result) {
        book.pages[start_index].hash = hash;
        book.pages[start_index].image = result.url;
        start_index++;
        uploadPages(res, book, pages, start_index);
      });
    }
  }
  
  // check next page for an image to upload
  start_index++;
  uploadPages(res, book, pages, start_index);
}

//// routes

app.get('/', function (req, res) {
  res.render('index', {
    translations: getTranslations(req)
  });
});

// user login and signup requests
app.get('/login', function (req, res) {
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

app.get('/signup', function (req, res) {
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

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

// personal profile (only works when logged in)
app.get('/profile', isLoggedIn, function (req, res) {
  res.render('profile', {
    user: req.user,
    translations: getTranslations(req)
  });
});

// user page (works for all web visitors)
app.get('/user/:id', function (req, res) {
  User.findById(req.params.id, function (err, viewUser) {
    Book.find({ user_id: req.params.id }, function (err, books) {
      res.render('user', {
        books: books,
        translations: getTranslations(req),
        user: viewUser
      });
    });
  });
});

// book pages (view and post)
app.get('/book/:book_id', function (req, res) {
  Book.findById(req.params.book_id, function (err, book) {
    res.render('book', {
      book: book,
      translations: getTranslations(req)
    });
  });
});

app.post('/book', function (req, res) {
  if (req.body.book_id) {
    Book.findById(req.body.book_id, function (err, book) {
      book.pages = [];
      for (var i=0; i<req.body.pages.length; i++) {
        var page = req.body.pages[i];
        
        if (book.pages.length > i) {
          // new page
          book.pages.push({ text: page.text, hash: "" });
        }
        else {
          // update existing page
          book.pages[i].text = page.text;
        }
      }

      uploadPages(res, book, req.body.pages, 0);
    });
  }
  else{
    var book = new Book();
    book.name = "hello";
    book.user_id = "536e934decbddf2809fa32a0";
    book.pages = [];
    for(var i=0; i<req.body.pages.length; i++){
      var page = req.body.pages[i];
      book.pages.push({ text: page.text, hash: "" });
    }
    
    uploadPages(res, book, req.body.pages, 0);
  }
});

app.listen(process.env.PORT || 3000);
module.exports = app;