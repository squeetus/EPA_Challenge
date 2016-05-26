var Facility = require('./../../app/controllers/facilities.js');

module.exports = function( app, handleError ) {
  app.get('/data', function (req, res) {
    res.send('Accessing Data!');
  });

  app.get('/facilities', Facility.showFacilities, handleError);
  app.get('/data/facilities', Facility.facilities, handleError);

  app.get('/facilities/:fid', Facility.showFacility, handleError);
  app.get('/data/facilities/:fid', Facility.facility, handleError);

  /************************************************

      Industry information

  ************************************************/

  // get list of unique industries
  app.get('/data/industries', Facility.industries, handleError);
  // get list of unique industries and total usage (largest to smallest)
  app.get('/data/industries/totalUsage', Facility.industriesTotalUsage, handleError);
  // get list of unique industries and yearly usage (largest to smallest)
  app.get('/data/industries/usage', Facility.industriesUsage, handleError);
  // get list of unique industries and total usage (largest to smallest)
  app.get('/data/industries/facilities', Facility.industriesFacilities, handleError);

};
