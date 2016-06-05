module.exports = function( app ) {

  app.get('/chart/:number', function( req, res ) {

    // allow range queries for the charts
    var from = (req.query.from) ? +req.query.from  : 1987,
      to = (req.query.to) ? +req.query.to : 2014,
      naics = (req.query.naics) ? (req.query.naics) : 221112,
      limit = (req.query.limit) ? (req.query.limit) : 100;

    res.render('chart', {version: req.params.number, params: {naics: naics, from: from, to: to, limit: limit} });
  });

  app.get('/all', function( req, res ) {

    // allow range queries for the charts
    var from = (req.query.from) ? +req.query.from  : 1987,
      to = (req.query.to) ? +req.query.to : 2014,
      naics = (req.query.naics) ? (req.query.naics) : 221112,
      limit = (req.query.limit) ? (req.query.limit) : 100;

    res.render('chart/all', {version: req.params.number, params: {naics: naics, from: from, to: to, limit: limit} });
  });
};
