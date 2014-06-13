var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var Team = require('../models/team');

module.exports = function(passport){
  passport.serializeUser(function(user, done){
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done) {
    process.nextTick(function() {
      User.findOne({ 'local.email' :  email }, function(err, user) {
        if(err){
          return done(err);
        }

        if(user){
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        }
        else{
          // save user's email and password
          var newUser = new User();
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);

          if(req.body.team){
            // find team object and connect user to team by ID
            var teamName = req.body.team.toLowerCase().replace(/\s/,'');
            Team.findOne({ 'name' :  teamName }, function(err, team) {
              if (err) {
                throw err;
              }
              if (!team) {
                return done(null, false, req.flash('signupMessage', 'That team does not exist.'));
              }
              newUser.teams = [teamName];
              newUser.save(function(err){
                if(err){
                  throw err;
                }
                team.users.push(newUser._id);
                team.save(function(err){
                  if(err){
                    throw err;
                  }
                  return done(null, newUser);
                });
              });
            });
          }
          else{
            // save user without team
            newUser.save(function(err){
              if(err){
                throw err;
              }
              return done(null, newUser);
            });
          }
        }
      });
    });
  }));


  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done){
    User.findOne({ 'local.email' :  email }, function(err, user){
      if(err){
        return done(err);
      }
      if(!user){
        return done(null, false, req.flash('loginMessage', 'No user found.'));
      }

      if(!user.validPassword(password)){
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
      }

      return done(null, user);
    });
  }));

};
