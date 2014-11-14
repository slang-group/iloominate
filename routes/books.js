var fs = require('fs');
var md5 = require('MD5');

var Book = require('../models/book');
var Template = require('../models/template');
var t = require('../static/translations');

// helper function to store multiple pages
function uploadPageImages (res, book, pages, start_index, image_index) {
  // reached end of book - return book ID
  if (start_index >= book.pages.length) {
    console.log('saving book');
    return book.save(function (err) {
      if (err) {
        throw err;
      }
      res.json({ id: book._id });
    });
  }

  var page = pages[start_index];
  image_index = image_index || 0;

  if (page.image && page.image.length && page.image[image_index]) {
    // store and update any images in local file system
    console.log('inspecting image');

    // notice when a HTTP URL is already present
    if (page.image[image_index].indexOf("http:") === 0) {
      console.log('avoiding http');
      image_index++;
      if (image_index >= page.image.length) {
        image_index = 0;
        start_index++;
      }
      return uploadPageImages(res, book, pages, start_index, image_index);
    }

    // create a shorter hash to notice when images change
    var hash = "";
    if (page.image[image_index]) {
      try {
        hash = md5(page.image[image_index]+"")+"";
      }
      catch(e) {
        hash = md5.digest_s(page.image[image_index]+"")+"";
      }
    }

    if (!book.pages[start_index].hash || book.pages[start_index].hash !== hash) {
      // upload this new or updated image
      console.log('no upload');
      book.pages[start_index].hash = hash;
      if (!book.pages[start_index].image) {
        book.pages[start_index].image = [];
      }
      book.pages[start_index].image[image_index] = page.image[image_index];
      image_index++;
      if (image_index >= page.image.length) {
        image_index = 0;
        start_index++;
      }
      return uploadPageImages(res, book, pages, start_index, image_index);

    } else {
      // presume existing image
      console.log('avoiding matching hash');
      image_index++;
      if (image_index >= page.image.length) {
        image_index = 0;
        start_index++;
      }
      return uploadPageImages(res, book, pages, start_index, image_index);
    }
  }

  // check next page for an image to upload
  console.log('next page');
  start_index++;
  uploadPageImages(res, book, pages, start_index);
}

// book (interactive, animated view)
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

// book (plain eBook view)
// book pages (view and post)
exports.plainbyid = function (req, res) {
  Book.findById(req.params.book_id, function (err, book) {
    if (err) {
      throw err;
    }
    res.render('plainbook', {
      book: book,
      translations: t.getTranslations(req, res)
    });
  });
};

exports.save = function (req, res) {
  if (req.body.book_id) {
    // updating book (currently no user check)
    Book.findById(req.body.book_id, function (err, book) {
      if (err) {
        throw err;
      }
      book.pages = [];
      for (var i=0; i<req.body.pages.length; i++) {
        var page = req.body.pages[i];

        if (book.pages.length >= i) {
          // new page
          book.pages.push({ text: page.text, image: [], hash: "", layout: page.layout });
        }
        else {
          // update existing page
          book.pages[i].text = page.text;
          book.pages[i].layout = page.layout;
        }
      }

      uploadPageImages(res, book, req.body.pages, 0);
    });
  }
  else{
    // creating new book
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
        book.pages.push({ text: page.text, hash: "", layout: page.layout });
      }

      uploadPageImages(res, book, req.body.pages, 0);
    } else {
      // creating book from layout
      book.layout = {
        pageWords: (req.body["per-page"] * 1) || 0,
        sentenceWords: (req.body["per-sentence"] * 1) || 0,
        wordSpace: (req.body["word-spacing"] * 1) || 0,
        lineSpace: (req.body["line-height"] * 1) || 0
      };

      book.layout.font = {
        name: req.body.font,
        size: req.body.fontSize
      };

      book.layout.text = {
        top: (req.body["top-page"] === "on"),
        bottom: (req.body["bottom-page"] === "on"),
        bg: (req.body["full-page"] === "on"),
        span: (req.body["span-page"] === "on")
      };

      book.layout.image = {
        top: (req.body["top-image"] === "on"),
        bottom: (req.body["bottom-image"] === "on"),
        bg: (req.body["bg-image"] === "on"),
        span: (req.body["span-image"] === "on")
      };

      book.layout.cover = {
        title: req.body.title || "",
        author: req.body.author || ""
      };

      book.layout.paperSize = req.body["paper-size"];
      book.layout.grader = req.body.grader;

      if (req.body.templatename) {
        // save template
        var template = new Template();
        template.layout = JSON.parse(JSON.stringify(book.layout));
        template.name = req.body.templatename;
        template.user_id = book.user_id;
        if (req.user.teams.length) {
          template.team = req.user.teams[0];
        }

        template.save(function(err) {
          if (err) {
            throw err;
          }
        });
      }

      if (!req.body.coverUrl && req.files.coverImage && req.files.coverImage.size) {
        // upload image and then load book
        var imageStream = fs.createReadStream(req.files.coverImage.path, { encoding: 'binary' });

        var fname = '/uploads/cover' + (new Date() * 1);
        var cloudStream = fs.writeFile(__dirname + '../static/' + fname, imageStream, function(err) {
          book.layout.cover.url = fname;
          book.save(function(err) {
            if (err) {
              throw err;
            }
            res.redirect('/edit?id=' + book._id + '&url=' + fname);
          });
        });

      } else {
        // book has no image on cover, or uses image from server
        book.layout.cover.url = req.body.coverUrl || "";
        book.save(function(err) {
          if (err) {
            throw err;
          }
          res.redirect('/edit?id=' + book._id);
        });
      }
    }
  }
};
