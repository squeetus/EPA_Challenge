var Facility = require('./../../app/controllers/facilities.js');

module.exports = function( app, handleError ) {
  app.get('/data', function (req, res) {
    res.send('Accessing Data!');
  });

  /************************************************

      Facility information

  ************************************************/

  ///////////////////
  //////  API  //////
  ///////////////////

  // get specified facility data
  app.get('/data/facilities/id/:fid', Facility.facility, handleError);
  // get list of unique facilities
  app.get('/data/facilities', Facility.facilities, handleError);

  // get list of unique facilities and total usage (largest to smallest)
  app.get('/data/facilities/usage/total', Facility.facilitiesTotalUsage, handleError);
  // get usage of facilities for a given set of chemicals
  app.get('/data/facilities/usage/chemicals/', Facility.chemicalUsage, handleError);

  // get list of top treatment method counts
  app.get('/data/methods', Facility.methods, handleError);

  // get list of top treatment method counts ??FILTERED FOR CHEMICAL AND FOR METHOD??
  app.get('/data/methods/chemical/method', Facility.methodsChemicalMethod, handleError);

  ///////////////////
  //////  Views  ////
  ///////////////////

  app.get('/facilities', Facility.showFacilities, handleError);
  app.get('/facilities/:fid', Facility.showFacility, handleError);

};
