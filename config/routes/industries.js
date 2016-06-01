var Industry = require('./../../app/controllers/industries.js');

module.exports = function( app, handleError ) {

  /************************************************

      Industry information

  ************************************************/

  // app.get('/data/test', Facility.test, handleError);

  ///////////////////
  //////  API  //////
  ///////////////////

  // get list of unique industries
  app.get('/data/industries', Industry.industries, handleError);
  // get facility data for a particular industry sector
  app.get('/data/industries/naics/:naics', Industry.industry, handleError);

  // get list of unique industries and total usage (largest to smallest)
  app.get('/data/industries/usage/total', Industry.industriesTotalUsage, handleError);
  // get list of unique industries and yearly usage (largest to smallest)
  app.get('/data/industries/usage/yearly', Industry.industriesYearlyTotalUsage, handleError);
  // get list of unique industries and yearly total usage for a specified subset of chemicals
  app.get('/data/industries/usage/chemicals', Industry.industriesYearlyTotalChemicalUsage, handleError);

  // get list of unique facilities in each industry sector
  app.get('/data/industries/facilities', Industry.industriesFacilities, handleError);

  // get list of top treatment method counts
  app.get('/data/industries/naics/:naics/methods', Industry.industryMethods, handleError);

  ///////////////////
  //////  Views  ////
  ///////////////////

};
