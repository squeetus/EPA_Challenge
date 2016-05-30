var mongoose = require('mongoose'),
    Chemical = mongoose.model('Chemical');

/************************************************

    Views for Facility queries

************************************************/

/*
    Generate a visualization for some number of chemicals
*/
exports.showChemicals = function(req, res, next) {
    var limit = (req.query.limit && req.query.limit < 100) ? req.query.limit : 10,
        page = (req.query.page) ? req.query.page : 1;

    res.render("chemicals", {limit: limit, page: page});
};

/************************************************

    API Endpoints for Chemical queries

************************************************/


/*
    Get chemical data for all chemicals
    Route: /data/chemicals
*/
exports.chemicals = function(req, res, next) {
    var limit = (req.query.limit) ? req.query.limit : 1000,
        skip = (req.query.skip) ? req.query.skip : 0;
    Chemical
        .find({})
        .sort( { chemical: 1 } )
        .skip(skip)
        .limit(limit)
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data");
            res.json(data);
    });
};

/*
    Get data related to a particular chemical (by cas number)
    Route: /data/chemical/cas/:cas
*/
exports.chemical = function(req, res, next) {
    Chemical
        .findOne({
            cas: req.params.cas
        })
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data for chemical with cas " + req.params.cas);
            res.json(data);
    });
};
