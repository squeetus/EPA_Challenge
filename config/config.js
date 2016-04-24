
var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'bridgesapi'
    },
    port: 4040,
    db: 'mongodb://localhost/EPA_University_Challenge'
  }
};

module.exports = config.development;
