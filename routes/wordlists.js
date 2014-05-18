var WordList = require('../models/wordlist');

exports.all = function (req, res) {
  WordList.find({}, function (err, lists) {
    res.json(lists);
  });
};

exports.save = function (req, res) {
  if (req.body.word_list_id) {
    // save an existing word list
  }
  else{
    var list = new WordList();
    list.name = req.body.name;
    list.words = req.body.wordlist.split(" ");
    list.save(function (err) {
      res.json({ id: list._id });
    });
  }
};