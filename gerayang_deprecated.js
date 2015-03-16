"use strict";
var mongoose = require("mongoose");
var keypress = require("keypress");
var request = require("request");
var cheer = require("cheerio");
var lazy = require("lazy");
var fs = require("fs");
var async = require("async");
var $ = "";
var uristring = "mongodb://localhost/kbbi_gerayang";
var collected = 0;
keypress(process.stdin); 
process.stdin.setRawMode(true);
var awalan = process.argv[2];
/* if (!max || !length) { */
/*   console.log("\nbutuh dua parameter tambahan. jumlah karakter dan maksimal percobaan."); */
/*   console.log("misal : 3 karakter permutasi dan 1000 kali percobaan."); */
/*   console.log("\n$ node gerayang.js 3 1000"); */
/*   console.log("\nselesai.\n"); */
/*   process.exit(); */
/* } */
process.stdin.on('keypress', function(ch,key){
  if (key && key.name == "q"){
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
      versi : String,
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
    var sedot = function(key, cb){
      var url = "http://kbbi.web.id/"+key;
      request(url, function(error, response, data) {
        if (error) {
          console.log("\nerror 404");
          var kata = new errorLema();
          kata.kata = key;
          kata.save(function(err){if(err)console.log(err)});
          /* process.exit(); */
          cb({error:"error"});
        } else {
          $ = cheer.load(data);
          if ($("#d1").text()) {
            lema.find({kata:key}).exec(function(err3, res3){
              if (res3.length > 0 && res3[0].kata === key) {
                console.log("\n'"+key+"' sudah ada di database");
              } else {
                console.log("\ndata ok ");
                console.log("arti "+key+" =" + $("#d1").text());
                var kata = new lema();
                collected++;
                if (key.slice(-2,-1) == "-") {
                  console.log("yo");
                  kata.kata = key.slice(0,-2);
                  kata.versi = key.slice(-1);
                } else {
                  kata.kata = key;
                }
                kata.arti = $("#d1").html();
                kata.save(function(err){if(err)console.log(err)});
                cb({
                  kata : key,
                  arti : $("#d1").text(),
                });
              }
            });
          } else if ($("#w2").text()) {
            var underscore = /_/i;
            var plus = /\+/i;
            if (underscore.test($("#0").attr("href"))) {
              cb({
                memuat : $("#0").attr("href"),
              });
            } else if (underscore.test($("#1").attr("href"))) {
              cb({
                memuat : $("#1").attr("href"),
              });
            } else if (underscore.test($("#2").attr("href"))) {
              cb({
                memuat : $("#2").attr("href"),
              });
            } else if (plus.test($("#0").attr("href"))) {
              console.log("\n'"+key+"' bukan kata dasar");
              var kata = new invalidLema();
              kata.kata = key;
              kata.save(function(err){if(err)console.log(err)});
              cb({empty:"empty"});
            }
          } else {
            console.log("\n'"+key+"' tidak ditemukan");
            var kata = new invalidLema();
            kata.kata = key;
            kata.save(function(err){if(err)console.log(err)});
            cb({empty:"empty"});
          }
        }
      
      });
    }
    var wordlist = [];
    new lazy(fs.createReadStream("./lema/"+awalan+".txt"))
      .lines
      .forEach(function(line){
        invalidLema.find({kata:line.toString()}).exec(function(err, res){
          if (res.length > 0 && res[0].kata == line.toString()) {
            console.log(line.toString()+" sudah pernah dicoba");
          } else {
            lema.find({kata:line.toString()}).exec(function(err2, res2){
              if (res2.length > 0 == line.toString()) {
                console.log(line.toString()+" sudah ada di database");
              } else {
                if (line.toString().slice(-3,-2) == "(") {
                  sedot(line.toString().slice(0,-4)+"-"+line.toString().slice(-2,-1), function(data){
                    console.log(line.toString());
                    if (data.memuat) {
                      console.log("yo "+data.memuat);
                      sedot(data.memuat, function(data){
                        console.log(line.toString());
                      });
                    }
                  });
                } else {
                  sedot(line.toString(), function(data){
                    console.log(line.toString());
                    if (data.memuat) {
                      console.log("yo "+data.memuat);
                      sedot(data.memuat, function(data){
                        console.log(line.toString());
                      });
                    }
                  });
                }
              } 
            });
          }
        });
      });
  }
});
var stream = process.stdout;
var spinner = 0;
setInterval(function(){
  var spin = ["◢","◣","◤","◥"];
  if (spinner == 4) spinner=0;

  stream.clearLine();
  stream.cursorTo(0);
  stream.write(spin[spinner]+" kbbi-gerayang...    ");
  spinner++;
}, 50);
