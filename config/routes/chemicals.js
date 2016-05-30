var Chemical = require('./../../app/controllers/chemicals.js');

module.exports = function( app, handleError ) {

  /************************************************

      Chemical information

  ************************************************/

  ///////////////////
  //////  API  //////
  ///////////////////
  app.get('/data', function (req, res) {
    res.send('Accessing Data!');
  });

  // get a list of all chemicals and their related data
  app.get('/data/chemicals', Chemical.chemicals, handleError);
  // get data for a specific chemical
  app.get('/data/chemical/cas/:cas', Chemical.chemical, handleError);



  ///////////////////
  //////  Views  ////
  ///////////////////

  app.get('/chemicals', Chemical.showChemicals, handleError);
};
