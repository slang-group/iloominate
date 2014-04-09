var express = require('express');
//var jsPDF = require('./lib/jspdf.min.js');

var app = express();
app.use(express.compress());
app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/lib'));

app.get('/', function(req, res){
  res.send('hello world');
});

app.get('/pdf', function(req, res){
  res.send("<script src='/jspdf.min.js'></script><script>var doc = new jsPDF(); doc.text(20, 20, 'Hello world.'); doc.save('Test.pdf');</script>");
});

app.listen(process.env.PORT || 3000);