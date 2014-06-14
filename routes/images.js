var t = require('../static/translations');
var Imager = require('../models/image');

exports.create = function (req, res) {
  res.render('imager', {
    translations: t.getTranslations(req, res)
  });
};

exports.byid = function (req, res) {
  Imager.findById(req.params.id, function (err, imager) {
    if (err) {
      throw err;
    }
    res.render('imager', {
      translations: t.getTranslations(req, res),
      image: imager
    });
  });
};
