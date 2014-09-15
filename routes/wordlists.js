var md5 = require('MD5');

var WordList = require('../models/wordlist');
var Team = require('../models/team');

exports.byid = function (req, res) {
  WordList.findById(req.params.id, function (err, list) {
    if (err) {
      throw err;
    }
    res.json(list);
  });
};

exports.all = function (req, res) {
  WordList.find({}).select('_id name hash').exec(function (err, lists) {
    if(err) {
      throw err;
    }
    res.json(lists);
  });
};

exports.inteam = function (req, res) {
  if (req.isAuthenticated()) {
    if(req.user.teams.length) {
      // select first team for now
      var teamName = req.user.teams[0];
      Team.findOne({ name: teamName, grader: req.query.grader }, function(err, team) {
        if (err) {
          throw err;
        }
        // select word lists of all users in team
        WordList.find({ 'user': { $in: team.users } }).select('_id name hash').exec(function(err, lists){
          if(err){
            throw err;
          }
          res.json(lists);
        });
      });
    }
    else {
      // no teams; go by user ID or empty
      WordList.find().or([{ user: req.user._id }, { user: null }]).select('_id name hash').exec(function (err, lists) {
        if(err){
          throw err;
        }
        res.json(lists);
      });
    }
  }
  else {
    // not signed in
    res.json([]);
  }
};

exports.save = function (req, res) {
  var hash;
  try {
    hash = md5(req.body.wordlist+"")+"";
  }
  catch(e) {
    hash = md5.digest_s(req.body.wordlist+"")+"";
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
        list.grader = req.body.grader || "words";
        if(req.isAuthenticated()){
          list.user = req.user._id;
        }
        list.words = req.body.wordlist.split(" ");
        list.save(function (err) {
          res.json({ id: list._id });
        });
      }
    });
  }
};
