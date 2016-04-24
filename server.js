var express = require('express');
var app = express();
var mongoose = require('mongoose');

// load in mongodb models
var modelsPath = __dirname + '/app/models';
require(modelsPath + '/chemicals.js');
require(modelsPath + '/facilities.js');

var EPAFileParser = require('./app/controllers/EPAFileParser');

mongoose.connect('mongodb://localhost/EPA_University_Challenge', function(err){
 if(err) console.log("Mongoose error: ", err);
});


// EPAFileParser.testChemical();
// EPAFileParser.testFacility();
EPAFileParser.clearDBS();

// run with --max-old-space-size=4096 to allocate enough memory
EPAFileParser.readFiles();





app.set('views', './app/views');
app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/home', function( req, res ) {

  res.render('index', {tits: "lol"});
});

app.get('/readFile', function( req, res ) {
  EPAFileParser.read(1987); // default file when no arg is passed
  res.render('index', {file: ["1987"]});
});

app.get('/readFile/:number', function( req, res ) {
  console.log(req.params.number);
  EPAFileParser.read(1);
  res.sendStatus(200);
});

// app.listen(4040, function () {
//   console.log('EPA Challenge app listening on port 4040!');
// });
