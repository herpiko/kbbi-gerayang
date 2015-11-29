// How to :
// node gerayang_reverse.js a

var fs = require('fs');
var mongoose = require("mongoose");
var keypress = require("keypress");
var request = require("request");
var lazy = require("lazy");
var fs = require("fs");
var async = require("async");
var uristring = "mongodb://localhost/kbbi_gerayang";
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
var reversed = new mongoose.Schema({
  kata : String,
  lema : String,
  arti : String,
  versi : String,
  awalan : String,
  penggalan : [],
}, {
  collection: 'reversed'
});
var Reversed = mongoose.model("reversed", reversed);
var kataDasar = new mongoose.Schema({
  kata : String,
  arti : String,
  versi : String,
  awalan : String,
}, {
  collection: 'valid'
});
var Lema = mongoose.model("kataDasar", kataDasar);
mongoose.connect(uristring, function(err,res){
  if (err) {
    console.log("gagal terkoneksi ke mongodb. pastikan anda sudah menyiapkan peladennya. galat :"+err);
  } else {
    console.log("berhasil terkoneksi mongodb");

    // For testing purpose
    /* var lema = "cekik (1)"; */
    /* Lema.findOne({kata : lema}, function(err, result){ */
    /*   parse(lema, result.arti); */
    /* }) */

    // Real
    Lema.find({awalan : awalan}, function(err, result){
      console.log(result);
      async.eachSeries(result, function(lema, cb){
        parse(lema.kata,lema.arti, function(){
          cb();
        });
      }, function(err){
        console.log("DONE");
        process.exit();
      })
    })  
  }
});

var parse = function(lema, str, callback) {
  var lema = lema;
  var lines = str.split("\r\n");
  var lemaSplitterRegex = new RegExp("&#xB7;");
  console.log(lines);
  async.eachSeries(lines, function(line, cb){
    if (lemaSplitterRegex.test(line)){
      var splitted = line.split("</b>")[0].split(">").slice(-1)[0].split("&#xB7;");
      var joinned = splitted.join("");
      current = joinned;
      var rev = {};
      rev.kata = joinned;
      if (lema[lema.length-1] == ")") {
        rev.lema = lema.split("(")[0];
        rev.versi = lema.split("(")[1].split(")")[0];
      } else {
        rev.lema = lema;
      }
      rev.penggalan = splitted;
      // If the second item of splitted contain lemaSplitter, check for it too
      if (line.split("</b>")[1] && lemaSplitterRegex.test(line.split("</b>")[1])) {
        lines.push(line.split("</b>")[1]);
      }
      Reversed.find({kata : rev.kata}, function(err, result){
        if (err) {
          cb(err);
        }
        if (result && result.length > 0) {
          console.log("Kata " + rev.kata + " sudah terdaftar");
          cb();
        } else {
          Reversed.create(rev, function(err, result){
            console.log(err);
            console.log(result);
            cb();
          });
        }
      })
    } else {
      console.log("skipped");
      cb();
    }
  }, function(err){
    if (err) {
      console.log(err);
    }
    callback();
  })
}

var stream = process.stdout;
var spinner = 0;
setInterval(function(){
  var spin = ["◢","◣","◤","◥"];
  if (spinner == 4) spinner=0;

  stream.clearLine();
  stream.cursorTo(0);
  stream.write(spin[spinner]+" kbbi-gerayang-reverse : "+current+"");
  spinner++;
}, 50);
