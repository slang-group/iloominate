var express = require('express');
var allTranslations = require('./static/translations').translations;

var app = express();
app.use(express.compress());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/lib'));

app.get('/', function(req, res){
  // detect language on server side, return translations
  var preferredLocale = req.query.language || req.headers['accept-language'].split(",")[0];
  if(!allTranslations[preferredLocale]){
    // check if there is a match for the root locale (es_uy -> es)
    preferredLocale = preferredLocale.split("_")[0];
    if(!allTranslations[preferredLocale]){
      // default (en)
      preferredLocale = "en";
    }
  }
  res.render('index', {
    translations: JSON.stringify( allTranslations[preferredLocale] )
  });
});

app.get('/test', function(req, res){
  res.send('hello world');
});

app.listen(process.env.PORT || 3000);