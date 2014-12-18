var fs = require('fs');
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

exports.clearhaiti = function (req, res) {
  WordList.find({ place: 'haiti' }).exec(function (err, lists) {
    if (err) {
      throw err;
    }
    for (var a = 0; a < lists.length; a++) {
      lists[a].delete();
    }
  });
};

exports.haiti = function (req, res) {
  WordList.find({ place: 'haiti' }).exec(function (err, lists) {
    if (err) {
      throw err;
    }
    if (!lists.length) {
      var levels = [];
      fs.readFile(__dirname + '/../static/masterlist.txt', { encoding: 'utf-8' }, function (err, file) {
        var lines = file.split("\n");
        var part_of_speech;
        for (var a = 0; a < lines.length; a++) {
          var line = lines[a];
          if (line.indexOf("~") > -1) {
            part_of_speech = line.replace("~~", "").replace("~~", "");
            continue;
          }
          if (line.indexOf("Level") > -1) {
            levels.push([]);
            continue;
          }
          if (!line.length) {
            continue;
          }
          var combined_words = line.split(', ');
          for (var c = 0; c < combined_words.length; c++) {
            combined_words[c] = part_of_speech + "~" + combined_words[c];
          }
          levels[levels.length - 1] = levels[levels.length - 1].concat(combined_words);
        }

        /*
        var list = new WordList();
        list.place = "haiti";
        list.name = "Ayiti";
        list.hash = "x";
        list.grader = "words";
        if(req.isAuthenticated()){
          list.user = req.user._id;
        }
        list.words = words;
        list.save(function (err) {
          res.json(list.words);
        });
        */
        res.json(levels);
      });
    } else {
      res.json(lists[0].words);
    }
  });
};

exports.inteam = function (req, res) {
  if (req.isAuthenticated()) {
    if(req.user.teams.length) {
      // select first team for now
      var teamName = req.user.teams[0];
      Team.findOne({ name: teamName }, function(err, team) {
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
        list.place = "haiti";
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
