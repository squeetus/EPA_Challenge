var mongoose = require('mongoose'),
    Facility = mongoose.model('Facility'),
    jsdom = require('jsdom'),
    d3 = require('d3');


/************************************************

    API Endpoints for Facility queries

************************************************/

/*
    Get all facilities
*/
exports.facilities = function(req, res, next) {
    var limit = (req.query.limit && req.query.limit < 55000) ? req.query.limit : 10,
        skip = (req.query.skip) ? req.query.skip : 0;

    Facility
        .find({})
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
*/
exports.showFacilities = function(req, res, next) {
    var limit = (req.query.limit && req.query.limit < 1000) ? req.query.limit : 10,
        page = (req.query.page) ? req.query.page : 1;
    res.render("facilities", {limit: limit, page: page});
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

/*
    return a list of facilities and the total aggregate usage
*/
exports.facilitiesTotalUsage = function(req, res, next) {
    Facility
        .aggregate([
          {$project: {
              tri_facility_id: 1,
              usage: {$sum: "$total_usage"},
            }
          },
          {$group: {
              _id: '$tri_facility_id',
              total: {$sum: "$usage"}
              }
          }
        ])
        .sort(
          {total: -1}
        )
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data for facilities.");
            res.json(data);
    });
};

/************************************************

    API Endpoints for industry queries

************************************************/

// mapreduce doesn't seem like a good approach:
// exports.test = function(req, res, next) {
//   var o = {};
//   o.map = function() {
//       emit(this.tri_facility_id, this.total_usage);
//   };
//   o.reduce = function(f, usage) {
//       return 1;
//   };
//   o.out = {inline : 1};
//   o.verbose = true;
//
//   Facility
//       .mapReduce(o, function (err, data) {
//         if (err) return next(err);
//         if (!data)
//            return next("no data for industries.");
//         res.json(data);
//       });
//
// };

/*
    return a list of unique industries
*/
exports.industries = function(req, res, next) {
    Facility
        .aggregate([
          {$group: {_id: '$primary_naics'}}
        ])
        .sort(
          {_id: 1}
        )
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data for industries");
            res.json(data);
    });
};

/*
    return a list of industry sectors and the total aggregate usage
*/
exports.industriesTotalUsage = function(req, res, next) {
    Facility
        .aggregate([
          {$project: {
              primary_naics: 1, primary_sic: 1,
              tri_facility_id: 1,
              usage: {$sum: "$total_usage"},
            }
          },
          {$group: {
              _id: '$primary_naics',
              total: {$sum: "$usage"}
              }
          }
        ])
        .sort(
          {total: -1}
        )
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data for industries.");
            res.json(data);
    });
};

/*
    return a list of industry sectors and the yearly total usage
*/
exports.industriesUsage = function(req, res, next) {
    var from = (req.query.from) ? req.query.from - 1986 : 0,
      to = (req.query.to) ? (req.query.to - 1986) : 27;

    // ensure range bounds for usage are reasonable
    if( from < 0 || from > 27) from = 0;
    if( to <= from || to > 27) to = 27;
    to = to - from;

    Facility
        .aggregate([
          // Project based on the range query
          {$project: {
              primary_naics: 1, primary_sic: 1,
              tri_facility_id: 1,
              // total_usage: 1,
              "usage_subset": {$slice : ["$total_usage", from, to]}
            }
          },
          {$group: {
             _id: "$primary_naics",
             usage: {$push: "$usage_subset"} // hacky: push all facilities' total usage into group's total usage
           }
          }
        ])
        .exec(function(err, data) {
            if (err) return next(err);
            if (!data)
              return next("no data for industries.");

            // compute total usage for each industry
            // for each industry
            data.forEach(function(d) {
              d.total = [];
              // initialize total array
              for(var i = 0; i < d.usage[0].length; i++ )
                d.total[i] = 0;

              // for each facility's usage
              d.usage.forEach(function(usage) {
                for(var i = 0; i < usage.length; i++ )
                  d.total[i] += usage[i];
              });
              delete d.usage;
            });

            res.json(data);
         });
};

/*
    return a list of industry sectors and the total aggregate usage
*/
exports.industriesFacilities = function(req, res, next) {
    Facility
        .aggregate([
          {$project: {
              primary_naics: 1, primary_sic: 1,
              tri_facility_id: 1,
            }
          },
          {$group: {
              _id: '$primary_naics',
              facilities: {$push: "$tri_facility_id"}
              }
          }
        ])
        .sort(
          {_id: 1}
        )
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data for industries.");
            res.json(data);
    });
};
