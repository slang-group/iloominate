var Team = require('../models/team');

exports.create = function (req, res) {
  if(req.isAuthenticated()) {
    var teamName = req.body.teamname.toLowerCase().replace(/\s/,'');
    Team.findOne({ 'name' :  teamName }, function(err, team) {
      if (err) {
        throw err;
      }
      if (!team) {
        // create and admin new team
        team = new Team();
        team.name = teamName;
        team.users = [req.user._id];
        team.admin = req.user._id;
        team.save(function(err){
          if(err){
            throw err;
          }

          req.user.admin = true;
          if(!req.user.teams){
            req.user.teams = [];
          }
          req.user.teams.push(teamName);
          req.user.save(function(err){
            if(err){
              throw err;
            }
            res.redirect('/profile?created');
          });
        });
      }
      else {
        // team already exists
        res.redirect('/profile');
      }
    });
  } else{
    // not logged in
    res.redirect('/login');
  }
};

exports.join = function(req, res){
  if(req.isAuthenticated()) {
    var teamName = req.body.teamname.toLowerCase().replace(/\s/,'');
    Team.findOne({ 'name' :  teamName }, function(err, team) {
      if(err) {
        throw err;
      }
      if(team) {
        if(team.users.indexOf(req.user._id) === -1) {
          // user is not yet on team
          // will code an invite process; for now just auto-accept
          team.users.push(req.user._id);
          team.save(function(err){
            if(err) {
              throw err;
            }

            if(!req.user.teams){
              req.user.teams = [];
            }
            req.user.teams.push(teamName);
            req.user.save(function(err){
              if(err){
                throw err;
              }
              res.redirect('/profile?joined');
            });
          });
        }
        else {
          // user is on team
          res.redirect('/profile?joined');
        }
      } else {
        // team does not exist
        res.redirect('/profile');
      }
    });
  }
  else {
    // not logged in
    res.redirect('/login');
  }
};

exports.manage = function(req, res){
  if(req.isAuthenticated()) {
    var teamName = req.params.name;
    Team.findOne({ 'name' :  teamName }, function(err, team) {
      if(err){
        throw err;
      }
      if(!team){
        // team name does not exist
        res.redirect('/profile');
      }
      else{
        if(team.admin === req.user._id){
          // admin of team
          res.render('admin', {
            team: team,
            user: req.user
          });
        }
        else{
          // logged in, but not admin of the team
          res.redirect('/profile');
        }
      }
    });
  }
  else{
    // no user logged in
    res.redirect('/login');
  }
};
