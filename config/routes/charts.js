module.exports = function( app ) {

  app.get('/chart/:number', function( req, res ) {

    // allow range queries for the charts
    var from = (req.query.from) ? +req.query.from  : 1986,
      to = (req.query.to) ? +req.query.to : 2013,
      naics = (req.query.naics) ? (req.query.naics) : 221112;

    res.render('chart', {version: req.params.number, params: {naics: naics, from: from, to: to} });
  });
};
