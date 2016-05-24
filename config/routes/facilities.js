var Facility = require('./../../app/controllers/facilities.js');

module.exports = function( app, handleError ) {
  app.get('/data', function (req, res) {
    res.send('Accessing Data!');
  });

  app.get('/facilities', Facility.showFacilities, handleError);
  app.get('/data/facilities', Facility.facilities, handleError);

  app.get('/facilities/:fid', Facility.showFacility, handleError);
  app.get('/data/facilities/:fid', Facility.facility, handleError);
};
