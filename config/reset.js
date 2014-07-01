var postmark = require("postmark")(process.env.POSTMARK_API_KEY);
var bcrypt = require("bcrypt-nodejs");

var User = require('../models/user');

exports.reset_mail = function(req, res) {
  User.find({ email: req.body.email }).execute(function(err, users) {
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
      "TextBody": "Hello! We heard that you had a problem with your password. Reset it at http://iloominate.herokuapp.com/reset?reset_time=" + reset_time + "&email=" + user_email
    }, function(err, success) {
      if(err) {
        res.send('Reset e-mail failed.');
      }
      else {
        res.send('Reset e-mail sent.');
      }
    });
  });
};

exports.reset_confirm = function(req, res) {
  User.find({ email: req.body.email }).execute(function(err, users) {
    if(users.length) {
      if (req.query.reset_time * 1 === users[0].reset_time * 1) {
        res.send('Confirmed!')
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
