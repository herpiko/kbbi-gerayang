"use strict";
var mongoose = require("mongoose");
var keypress = require("keypress");
var request = require("request");
var cheer = require("cheerio");
var $ = "";
var uristring = "mongodb://localhost/kbbi_gerayang";
keypress(process.stdin); 
process.stdin.setRawMode(true);
var charset = [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
];
var max = process.argv[3];
var length = process.argv[2];
if (!max || !length) {
  console.log("\nbutuh dua parameter tambahan. jumlah karakter dan maksimal percobaan.");
  console.log("misal : 3 karakter permutasi dan 1000 kali percobaan.");
  console.log("\n$ node gerayang.js 3 1000");
  console.log("\nselesai.\n");
  process.exit();
}
var i = 0;
var collected = 0;
var result = "";
process.stdin.on('keypress', function(ch,key){
  if (key && key.name == "q"){
    console.log("\nberhasil menggerayang "+collected+" buah kata dasar baru ke basis data");
    console.log("\nselesai.\n");
    process.exit();
  }
});
mongoose.connect(uristring, function(err,res){
  if (err) {
    console.log("gagal terkoneksi ke mongodb. pastikan anda sudah menyiapkan peladennya. galat :"+err);
  } else {
    console.log("berhasil terkoneksi mongodb");
    var kataDasar = new mongoose.Schema({
      kata : String,
      arti : String,
    }, {
      collection: 'validKata'
    });
    var invalid = new mongoose.Schema({
      kata : String,
    }, {
      collection: 'invalidKata'
    });
    var error = new mongoose.Schema({
      kata : String,
    }, {
      collection: 'errorKata'
    });
    var lema = mongoose.model("kataDasar", kataDasar);
    var invalidLema = mongoose.model("invalidKata", invalid);
    var errorLema = mongoose.model("errorKata", error);
    
    var sedot = function(key, cb){
      var url = "http://kbbi.web.id/"+key;
      request(url, function(error, response, data) {
        if (error) {
          console.log("\nerror 404");
          var kata = new errorLema();
          kata.kata = key;
          kata.save(function(err){if(err)console.log(err)});
          process.exit();
          /* cb({error:"error"}); */
        } else {
          $ = cheer.load(data);
          if ($("#d1").text()) {
            console.log("\ndata ok ");
            console.log("arti "+key+" =" + $("#d1").text());
            var kata = new lema();
            collected++;
            kata.kata = key;
            kata.arti = $("#d1").html();
            kata.save(function(err){if(err)console.log(err)});
            cb({
              kata : key,
              arti : $("#d1").text(),
            });
          } else {
            console.log("\n'"+key+"' bukan kata dasar");
            var kata = new invalidLema();
            kata.kata = key;
            kata.save(function(err){if(err)console.log(err)});
            cb({empty:"empty"});
          }
        }
      
      });
    }

    
    var permutation = function(max, length, chars){
        var len = length;
        var seq = [];
        for (var a = 0; a < len; a++) {
          seq.push(0);
        }
        var cursor = seq.length-1;
        var latest_result;
        var stop;
        console.log("Menggerayangi KBBI dengan "+length+" karakter sebanyak "+max+" kali"); 
        (function loop(){
          if (i <= max && !stop) {
        /* setInterval(function(){ */
            result = "";
            for (var a = 0; a < len; a++) {
              result = result + charset[seq[a]];
            }
            /* console.log(seq); */
            if (latest_result == result || result.match(/undefined/g)) {
              result = "---stopped---";
              stop = true;
            } else{
              latest_result = result;
              invalidLema.find({kata:result}).exec(function(err, res){
                if (res.length > 0 && res[0].kata == result) {
                  /* console.log(res); */
                  /* console.log("'"+result+"' sudah pernah dicoba"); */
                  var counted = seq[cursor] + 1; 
                  if (counted < 26) {
                    seq[cursor]++; 
                  } else {
                    var x=0;
                    for (var z = 1; z < len; z++) {
                      if (seq[cursor-z] < 25) {
                        seq[cursor-z]++;
                        for (var y = 0; y < z; y++) {
                          seq[cursor-y] = 0;
                        }
                        break;
                      }
                    }
                  }
                  i++;
                  loop();
                } else {
                  lema.find({kata:result}).exec(function(err2,res2){
                    if (res2.length > 0) {
                      /* console.log("'"+result+"' sudah ada di database"); */
                      var counted = seq[cursor] + 1; 
                      if (counted < 26) {
                        seq[cursor]++; 
                      } else {
                        var x=0;
                        for (var z = 1; z < len; z++) {
                          if (seq[cursor-z] < 25) {
                            seq[cursor-z]++;
                            for (var y = 0; y < z; y++) {
                              seq[cursor-y] = 0;
                            }
                            break;
                          }
                        }
                      }
                      i++;
                      loop();
                    } else {
                      sedot(result,function(data){
                        var counted = seq[cursor] + 1; 
                        if (counted < 26) {
                          seq[cursor]++; 
                        } else {
                          var x=0;
                          for (var z = 1; z < len; z++) {
                            if (seq[cursor-z] < 25) {
                              seq[cursor-z]++;
                              for (var y = 0; y < z; y++) {
                                seq[cursor-y] = 0;
                              }
                              break;
                            }
                          }
                        }
                        i++;
                        loop();
                      });
                    }
                  });
                }
              });
            }
          /* }, 100); */
          }
        }());
    }
    permutation(max,length,charset);
  }
});
var stream = process.stdout;
var spinner = 0;
setInterval(function(){
  var spin = ["◢","◣","◤","◥"];
  /* var spin = [ */
  /* "▉            ", */
  /* " ▊           ", */
  /* "  ▋          ", */
  /* "   ▌         ", */
  /* "    ▍        ", */
  /* "     ▎       ", */
  /* "      ▏      ", */
  /* "       ▎     ", */
  /* "        ▍    ", */
  /* "         ▌   ", */
  /* "          ▋  ", */
  /* "           ▊ ", */
  /* "            ▉", */
  /* "             "  */
  /* ]; */
  if (spinner == 4) spinner=0;

  stream.clearLine();
  stream.cursorTo(0);
  stream.write(spin[spinner]+" kbbi-gerayang '"+result+"'...    ");
  spinner++;
}, 50);
