var express = require('express');

var app = express();
app.use(express.compress());
app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/lib'));

app.get('/test', function(req, res){
  res.send('hello world');
});

app.listen(process.env.PORT || 3000);