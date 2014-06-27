var cloudinary = require('cloudinary');
var md5 = require('MD5');

var t = require('../static/translations');
var Imager = require('../models/image');

exports.create = function (req, res) {
  res.render('imager', {
    translations: t.getTranslations(req, res),
    image: { id: "" }
  });
};

exports.byid = function (req, res) {
  Imager.findById(req.params.id).select('_id name upload').exec(function (err, imager) {
    if (err) {
      throw err;
    }
    res.render('imager', {
      translations: t.getTranslations(req, res),
      image: imager
    });
  });
};

exports.all = function (req, res) {
  Imager.find({}).select('_id name upload').exec(function (err, images) {
    if(err) {
      throw err;
    }
    res.json(images);
  });
};

exports.inteam = function (req, res) {
  if (req.isAuthenticated()) {
    if(req.user.teams.length) {
      // select first team for now
      var teamName = req.user.teams[0];
      Team.findOne({ 'name' :  teamName }, function(err, team) {
        if (err) {
          throw err;
        }
        // select word lists of all users in team
        Imager.find({ 'user': { $in: team.users } }).select('_id name upload').exec(function(err, images){
          if(err){
            throw err;
          }
          res.json(images);
        });
      });
    }
    else {
      // no teams; go by user ID or empty
      Imager.find().or([{ user: req.user._id }, { user: null }]).select('_id name upload').exec(function (err, images) {
        if(err){
          throw err;
        }
        res.json(images);
      });
    }
  }
  else {
    // not signed in
    res.json([]);
  }
};

exports.save = function (req, res) {
  if (req.isAuthenticated()) {
    if(req.body.id) {
      // updating saved image
      Imager.findById(req.body.id, function(err, img) {
        if (err) {
          throw err;
        }
        if (img.user === req.user._id) {
          // can update own images
          cloudinary.uploader.upload(req.body.src, function (result) {
            img.upload = result.url;
            img.icons = req.body.icons;
            img.save(function(err) {
              if (err) {
                throw err;
              }
              res.json({ image_id: img._id });
            });
          });
        }
        else {
          res.json({ err: "fail" });
        }
      });
    } else {
      // create new image connected to user
      cloudinary.uploader.upload(req.body.src, function (result) {
        var img = new Imager();
        img.user = req.user._id;
        img.upload = result.url;
        img.icons = req.body.icons;
        img.save(function(err) {
          if (err) {
            throw err;
          }
          res.json({ image_id: img._id });
        });
      });
    }
  }
  else {
    // not signed in
    res.json({ err: "fail" });
  }
};
