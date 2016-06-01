var mongoose = require('mongoose'),
    Facility = mongoose.model('Facility'),
    jsdom = require('jsdom'),
    d3 = require('d3');


/************************************************

    Views for Facility queries

************************************************/

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
    Generate a visualization for some number of facilities
*/
exports.showFacilities = function(req, res, next) {
    var limit = (req.query.limit && req.query.limit < 1000) ? req.query.limit : 10,
        page = (req.query.page) ? req.query.page : 1;
    res.render("facilities", {limit: limit, page: page});
};


/************************************************

    API Endpoints for Facility queries

************************************************/


/*
    Get all facilities
    Route: /data/facilities
*/
exports.facilities = function(req, res, next) {
    var limit = (req.query.limit) ? +req.query.limit : 100,
        skip = (req.query.skip) ? +req.query.skip : 0;

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
    Get a single specified facility
    Route: /data/facilities/id/:fid
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
    Return a list of facilities and their total aggregate chemical usage
    Route: /data/facilities/usage/total
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

/*
    Return a list of facilities and their yearly aggregate usage for the specified array of chemical IDs
    Route: /data/facilities/usage/chemicals
*/
exports.chemicalUsage = function(req, res, next) {
  var from = (req.query.from) ? req.query.from - 1986 : 0,
    to = (req.query.to) ? (req.query.to - 1986) : 27,
    chem = (req.query.chems) ? req.query.chems.split(',') : [];

  // ensure range bounds for usage are reasonable
  if( from < 0 || from > 27) from = 0;
  if( to <= from || to > 27) to = 27;

  var use = false;

  Facility
      .aggregate([
        {$match: {
            chemicals: {
               $elemMatch: { chemical : {$in : chem } } // find facilities with particular chemical usage
             }
          }
        },
        {$project: {
            primary_naics: 1, primary_sic: 1,
            tri_facility_id: 1,
            chemicals: {$filter: {  // only project the relevant chemicals
                input: '$chemicals',
                as: 'c',
                cond: {$in : ['$$c.chemical', chem ] }  //https://jira.mongodb.org/browse/SERVER-6146
              }
            }
          }
        },
        {$project: {
            tri_facility_id: 1,
            usage: "$chemicals.usage.total_usage", // grab out total usage** (depends if we want overall vs breakdown)
            // stuff: {$sum: [ use, "$chemicals.usage.air", 0 ]}
          }
        }
      ])
      // .limit(10)
      .exec(function (err, data) {
          if (err) return next(err);
          if (!data)
              return next("no data for industries.");

          // compute yearly total usage for the specific chemicals for each facility
          // for each facility
          data.forEach(function(d) {
            d.total = [];
            // initialize total array
            for(var i = 0; i < d.usage[0].length; i++ )
              d.total[i] = 0;

            // for each chemical's usage
            d.usage.forEach(function(usage) {
              // for each year
              for(var i = 0; i < usage.length; i++ )
                d.total[i] += usage[i];
            });
            delete d.usage;
            d.total = d.total.slice(from, to);

          });

          res.json(data);
  });
};

exports.methods = function(req, res, next) {
  Facility
      .aggregate([
        {$match: {
            chemicals: {
               $elemMatch: { methods: {$exists: true} } // find facilities with any treatment method
             }
          }
        },
        {$project:{
            primary_naics: 1,
            tri_facility_id: 1,
            chemicals: {$filter: {  // only project the relevant chemicals
                input: '$chemicals',
                as: 'c',
                cond: { $gte : [ '$$c.methods', null ] }  // filter chemicals to include only those with treatment methods
              }
            }
          }
        },
        {$project: {
            primary_naics: 1,
            tri_facility_id: 1,
            // chemicals: 1
            chemicals: "$chemicals.chemical",
            methods: "$chemicals.methods"
          }
        },
      ])
      .limit(1000)
      .exec(function (err, data) {
          if (err) return next(err);
          if (!data)
              return next("no data for treatment methods.");
          res.json(data);
  });
};
