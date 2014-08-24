var cloudinary = require('cloudinary');
var md5 = require('MD5');

var Book = require('../models/book');
var t = require('../static/translations');

// helper function to store multiple pages
function uploadPages (res, book, pages, start_index) {
  // reached end of book - return book ID
  if (start_index >= book.pages.length) {
    return book.save(function (err) {
      if (err) {
        throw err;
      }
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

// book pages (view and post)
exports.byid = function (req, res) {
  Book.findById(req.params.book_id, function (err, book) {
    if (err) {
      throw err;
    }
    res.render('book', {
      book: book,
      translations: t.getTranslations(req, res)
    });
  });
};

exports.save = function (req, res) {
  if (req.body.book_id) {
    Book.findById(req.body.book_id, function (err, book) {
      if (err) {
        throw err;
      }
      book.pages = [];
      for (var i=0; i<req.body.pages.length; i++) {
        var page = req.body.pages[i];

        if (book.pages.length >= i) {
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
    if(req.isAuthenticated()){
      book.user_id = req.user._id;
    }
    else{
      book.user_id = "536e934decbddf2809fa32a0";
    }
    book.pages = [];

    if (req.body.pages && req.body.pages.length) {
      // uploading pages from editor
      for(var i=0; i<req.body.pages.length; i++){
        var page = req.body.pages[i];
        book.pages.push({ text: page.text, hash: "" });
      }

      uploadPages(res, book, req.body.pages, 0);
    } else {
      // creating book
      book.layout = {};
      book.layout.font = {};
      book.layout.font.name = req.body.font;
      book.save(function(err) {
        if (err) {
          throw err;
        }
        res.redirect('/edit?id=' + book._id);
      });
    }
  }
};
