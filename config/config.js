
var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'bridgesapi'
    },
    port: 3000,
    // db: 'mongodb://heroku_app27208241:lg0jm38s5r1pbl0g6e68fcbiih@ds061228.mongolab.com:61228/heroku_app27208241'
    db: 'mongodb://localhost/bridgesapi-development'
  }
};

console.log(config);
module.exports = config[0];
