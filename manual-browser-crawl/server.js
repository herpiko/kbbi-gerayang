var express = require('express');
var app = express();
var fs = require('fs');
var async = require('async');
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.get('/:char/:data', function(req, res) {
  var data = req.params.data.split(',');
console.log(req.params.data);
	console.log(data);
  async.eachSeries(data, function(word, cb) {
    fs.appendFile(req.params.char + '.txt', word + '\n', function(){
			console.log(word);
      cb();
    })
  }, function(){
    res.send('ok');
  })
})

app.listen(3000)
