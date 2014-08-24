var postmark = require("postmark")(process.env.POSTMARK_API_KEY);
var bcrypt = require("bcrypt-nodejs");

var User = require('../models/user');

exports.reset_mail = function(req, res) {
  User.find({ "local.email": req.body.email }).exec(function(err, users) {
    var user_email = '';
    var reset_time = (new Date()) * 1;
    if(users.length) {
      user_email = users[0].local.email;

      // temporary reset to password
      bcrypt.genSalt(5, function(err, salt) {
        users[0].local.password = salt;
        users[0].reset_time = reset_time;
        users[0].save(function(err) {
          console.log(err);
        });
      });
    }
    postmark.send({
      "From": "ndoiron@mapmeld.com",
      "To": user_email,
      "Subject": "Password reset from iLoominate",
      "TextBody": "Hello! We heard that you had a problem with your password. Reset it at http://iloominate.org/reset?reset_time=" + reset_time + "&email=" + user_email
    }, function(err, success) {
      if(err) {
        console.log(err);
        res.send('Reset e-mail failed.');
      }
      else {
        res.send('Reset e-mail sent.');
      }
    });
  });
};

exports.reset_confirm = function(req, res) {
  User.find({ "local.email": req.query.email }).exec(function(err, users) {
    if(users.length) {
      var user = users[0];
      if (req.query.reset_time * 1 && req.query.reset_time * 1 === user.reset_time * 1) {
        postmark.send({
          "From": "ndoiron@mapmeld.com",
          "To": user.local.email,
          "Subject": "New Password from iLoominate",
          "TextBody": "Hello! You just reset your password. Your new password is " + user.local.password
        }, function(err, success) {
          if(err) {
            res.send('Reset e-mail failed.');
          }
          else {
            res.send('Confirmed! A new password was sent to your e-mail address.');

            // unset user's reset_time param
            user.reset_time = 0;
            var reset = user.local.password + "";
            user.local.password = user.generateHash(reset);
            user.save();
          }
        });
      }
      else {
        res.send('False or expired password reset link');
      }
    }
    else {
      res.send('False or expired password reset link');
    }
  });
}
