var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    config = require('./config/config');

/* Set up Mongo connection and models */
var modelsPath = __dirname + '/app/models';
require(modelsPath + '/chemicals.js');
require(modelsPath + '/facilities.js');
mongoose.connect(config.db, function(err){
 if(err) console.log("Mongoose error: ", err);
});

var EPAFileParser = require('./app/controllers/EPAFileParser');
EPAFileParser.clearDBS();
// run with --max-old-space-size=4096 to allocate enough memory
EPAFileParser.readFiles();

// serve static files from the public directory
app.use(express.static(config.root + '/public'));

app.listen(config.port, function () {
  console.log('EPA Challenge app listening on port', config.port, '!');
});

/* Load Routes */
require('./config/routes/index')( app );

exports = module.exports = app;
