var fs = require('fs');
var cheerio = require('cheerio');
var request = require('hyperquest');
var uri = 'http://badanbahasa.kemdikbud.go.id/kbbi/index.php';
var mongoose = require("mongoose");
var keypress = require("keypress");
var request = require("request");
var lazy = require("lazy");
var fs = require("fs");
var async = require("async");
var $ = "";
var uristring = "mongodb://localhost/kbbi_gerayang";
var collected = 0;
var current = "";
keypress(process.stdin); 
process.stdin.setRawMode(true);
var awalan = process.argv[2];
process.stdin.on('keypress', function(ch,key){
  if (key && key.name == "q"){
    console.log("\nselesai.\n");
    process.exit();
  }
});
var kataDasar = new mongoose.Schema({
  kata : String,
  arti : String,
  versi : String,
  awalan : String,
}, {
  collection: 'valid'
});
var invalid = new mongoose.Schema({
  kata : String,
}, {
  collection: 'invalid'
});
var error = new mongoose.Schema({
  kata : String,
}, {
  collection: 'error'
});
var lema = mongoose.model("kataDasar", kataDasar);
var invalidLema = mongoose.model("invalidKata", invalid);
var errorLema = mongoose.model("errorKata", error);
mongoose.connect(uristring, function(err,res){
  if (err) {
    console.log("gagal terkoneksi ke mongodb. pastikan anda sudah menyiapkan peladennya. galat :"+err);
  } else {
    console.log("berhasil terkoneksi mongodb");
new lazy(fs.createReadStream("./lema/"+awalan+".txt"))
  .lines
  .forEach(function(line){
    invalidLema.find({kata:line.toString()}).exec(function(err, res){
      if (res.length > 0 && res[0].kata == line.toString()) {
        console.log(line.toString()+" sudah pernah dicoba");
      } else {
        lema.find({kata:line.toString()}).exec(function(err2, res2){
          if (res2.length > 0 && res2[0].kata == line.toString()) {
            console.log(line.toString()+" sudah ada di database");
          } else {
            new Get(line.toString());
          } 
        });
      }
    });
  });
  }
});
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
      var data ='OPKODE=1&PARAM='+input+'&DFTKATA='+input+'&KATA='+input+'&PERINTAH2=Tampilkan';
  var req = self.make(data);
  self.parse2(req, input);
}

Get.prototype.parse2 = function (r2, input) {
  var self = this;
  var data = '';
  r2.on('data', function(buf){ data += buf; });
  r2.on('end', function(){
    var kata = new lema();
    var $ = cheerio.load(data);
    $('p').each(function(){
      kata.arti = $(this).html();
      console.log(kata.arti);
      kata.kata = $('#KATA').val();
      kata.awalan = awalan;
      current = $('#KATA').val();
      kata.save(function(err){if(err)console.log(err)});
    });
  });
}

var stream = process.stdout;
var spinner = 0;
setInterval(function(){
  var spin = ["◢","◣","◤","◥"];
  if (spinner == 4) spinner=0;

  stream.clearLine();
  stream.cursorTo(0);
  stream.write(spin[spinner]+" kbbi-gerayang : "+current+"");
  spinner++;
}, 50);
