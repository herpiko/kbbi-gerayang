// get words
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('hyperquest');
var uri = 'http://badanbahasa.kemdikbud.go.id/kbbi/index.php';

function Get(input){
  this.dump = input + '.txt';
  this.init(input);
}

Get.prototype.make = function(data) {
  var r = request.post(uri);
  r.setHeader('Content-Length', data.length);
  r.setHeader('Content-Type', 'application/x-www-form-urlencoded');
  r.end(data);
  return r;
}

Get.prototype.init = function(input) {
  var self = this;
      var data ='OPKODE=1&PARAM=aku&DFTKATA=aku&KATA=aku&PERINTAH2=Tampilkan';
      console.log(data);
  var req = self.make(data);
  self.parse2(req, input);
}

Get.prototype.parse2 = function (r2, input) {
  var self = this;
  var data = '';
  r2.on('data', function(buf){ data += buf; });
  r2.on('end', function(){
  console.log(data)
    var $ = cheerio.load(data);
    $('p').each(function(){
      console.log($(this).text());
    });
  });
}


var chars = ['aku' ];
for(var i = 0; i < chars.length; i++)
  new Get(chars[i]);
