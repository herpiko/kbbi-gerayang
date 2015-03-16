// get words
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('hyperquest');
var uri = 'http://badanbahasa.kemdikbud.go.id/kbbi/index.php';

function Get(input){
  this.dump = "lema/"+input + '.txt';
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
  var data = 'OPKODE=2&PARAM='+ input + '&PERINTAH=Cari';
  var req = self.make(data);
  self.parse(req, input);
}

Get.prototype.next = function(input, head, more) {
  var self = this;
  var data = 'OPKODE=2&PARAM='+ input + '&PERINTAH=Berikut&MORE=' + more + '&HEAD=' + head;
  var req = self.make(data);
  self.parse(req, input);
}

Get.prototype.parse = function (r, input, done) {
  var self = this;
  var data = '';
  r.on('data', function(buf){ data += buf; });
  r.on('end', function(){
    var $ = cheerio.load(data);
    $('li a').each(function(){
      fs.appendFileSync(self.dump, $(this).text() + '\n');
    });
    var more = $('input[name="MORE"]').val();
    var head = $('input[name="HEAD"]').val();
    console.log ('got ' + input, 'head', head, 'more', more);
    if (more > 0 && input) 
      self.next(input, head, more);
    else
      if (done) done();
  });
}

var chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 
             'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
       'u', 'v', 'w', 'x', 'y', 'z'
      ];
for(var i = 0; i < chars.length; i++)
  new Get(chars[i]);
