var cradle = require('cradle');

var template_db = new(cradle.Connection)().database('templates');

// template JSON
exports.byid = function (req, res) {
  template_db.get(req.params.id, function (err, template) {
    if (err) {
      throw err;
    }
    res.json(template.layout);
  });
};
