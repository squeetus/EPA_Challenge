var Chemical = require('./../../app/controllers/chemicals.js');

module.exports = function( app, handleError ) {
  app.get('/data', function (req, res) {
    res.send('Accessing Data!');
  });

  app.get('/chemicals', Chemical.showChemicals, handleError);
  app.get('/data/chemicals', Chemical.chemicals, handleError);

  app.get('/data/chemical/:cas', Chemical.chemical, handleError);
};
