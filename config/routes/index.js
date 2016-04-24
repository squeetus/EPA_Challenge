var fs = require('fs');

module.exports = function(app) {
    app.set('views', './app/views');
    app.set('view engine', 'jade');

    /* Generic error function for all routes */
    var handleError = function( err, req, res, next ) {
      console.log("Handling: ", err);
      res.render("index", {error: err});
    };

    /* bootstrap all routes */
    fs.readdirSync(__dirname).forEach(function(file) {
        if (file === "index.js" || file.substr(file.lastIndexOf('.') + 1) !== 'js')
            return;
        var name = file.substr(0, file.indexOf('.'));
        require('./' + name)(app, handleError);
    });
};
