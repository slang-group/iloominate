var md5 = require('MD5');

var WordList = require('../models/wordlist');

exports.all = function (req, res) {
  WordList.find({}, function (err, lists) {
    res.json(lists);
  });
};

exports.save = function (req, res) {
  var hash;
  try {
    hash = md5(page.image+"")+"";
  }
  catch(e) {
    hash = md5.digest_s(page.image+"")+"";
  }

  if (req.body.word_list_id) {
    // save an existing word list
    WordList.findById(function(err, list){
      list.words = req.body.wordlist.split(" ");
      list.hash = hash;
      list.save(function (err) {
        res.json({ id: list._id });
      });
    });
  }
  else{
    // save a word list
    // check that this word list is, in fact, new
    WordList.findOne({ hash: hash }, function(err, list){
      if(list){
        res.json({ id: list._id });
      }
      else{
        list = new WordList();
        list.name = req.body.name;
        list.hash = hash;
        list.words = req.body.wordlist.split(" ");
        list.save(function (err) {
          res.json({ id: list._id });
        });
      }
    });
  }
};
