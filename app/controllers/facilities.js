var mongoose = require('mongoose'),
    Facility = mongoose.model('Facility'),
    jsdom = require('jsdom'),
    d3 = require('d3');


/*
    API endpoint for some number of facilities
*/
exports.facilities = function(req, res, next) {
    var limit = (req.query.limit && req.query.limit < 55000) ? req.query.limit : 10,
        chemicals = (req.query.chemicals) ? req.query.chemicals : false,
        skip = (req.query.skip) ? req.query.skip : 0;

    Facility
        .find({})
        // {
        //   chemicals: chemicals
        // })
        .sort( { facility_name: 1 } )
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
    Generate a visualization for some number of facilities
    (Render html)
*/
exports.showFacilities = function(req, res, next) {
    res.render("facilities");
};

/*
    Generate a visualization for a particular facility
    (Render html)
*/
exports.showFacility = function(req, res, next) {
  var htmlStub = '<div id="facility-container"></div>';
    Facility
        .findOne({
            tri_facility_id: req.params.fid
        })
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data for facility with facility id " + req.params.fid);
            // res.render("facilities", {data: data});

            // use jsdom and d3 to render the page, then send it to the client
            jsdom.env(
              htmlStub,
              function (errors, window) {
                var el = window.document.querySelector('#facility-container');
                // var body = window.document.querySelector('body');

                // bind facilities to divs
                d3.select(el).selectAll('div')
                      .data([data])
                    .enter().append('div')
                      .text(function(d) {
                        return d.tri_facility_id;
                      });

                res.send(window.document.documentElement.innerHTML);
              }
            );
    });
};

/*
    API endpoint for a single specified facility
*/
exports.facility = function(req, res, next) {
    Facility
        .findOne({
            tri_facility_id: req.params.fid
        })
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data for facility with facility id " + req.params.fid);
            res.json(data);
    });
};
