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
  app.get('/data/facilities/totalUsage', Facility.facilitiesTotalUsage, handleError);

  ///////////////////
  //////  Views  ////
  ///////////////////

  app.get('/facilities', Facility.showFacilities, handleError);
  app.get('/facilities/:fid', Facility.showFacility, handleError);


  /************************************************

      Industry information

  ************************************************/

  // app.get('/data/test', Facility.test, handleError);

  ///////////////////
  //////  API  //////
  ///////////////////

  // get list of unique industries
  app.get('/data/industries', Facility.industries, handleError);
  // get list of unique industries and total usage (largest to smallest)
  app.get('/data/industries/totalUsage', Facility.industriesTotalUsage, handleError);
  // get list of unique industries and yearly usage (largest to smallest)
  app.get('/data/industries/usage', Facility.industriesUsage, handleError);
  // get list of unique industries and total usage (largest to smallest)
  app.get('/data/industries/facilities', Facility.industriesFacilities, handleError);

  ///////////////////
  //////  Views  ////
  ///////////////////
};
