var Template = require('../models/template');

// template JSON
exports.byid = function (req, res) {
  Template.findById(req.params.id, function (err, template) {
    if (err) {
      throw err;
    }
    res.json(template.layout);
  });
};
