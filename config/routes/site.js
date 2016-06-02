module.exports = function( app ) {
  app.get('/', function (req, res) {
    res.send('Hello World!');
  });

  app.get('/home', function( req, res ) {
    res.render('index', {args: ["arg", "arg2"] });
  });
};
