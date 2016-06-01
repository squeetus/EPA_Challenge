var mongoose = require('mongoose'),
    Facility = mongoose.model('Facility'),
    jsdom = require('jsdom'),
    d3 = require('d3');

/************************************************

    API Endpoints for industry queries

************************************************/

/*
    Return facility data for a particular industry sector
    Route:  /data/industries/naics/:naics
*/
exports.industry = function(req, res, next) {
    var from = (req.query.from) ? req.query.from - 1986 : 0,
      to = (req.query.to) ? (req.query.to - 1986) : 27;

    // ensure range bounds for usage are reasonable
    if( from < 0 || from > 27) from = 0;
    if( to <= from || to > 27) to = 27;
    to = to - from;

    Facility
        .aggregate([
          {$match: {
            primary_naics: +req.params.naics  // match industry sector
            }
          },
          {$project: {
            usage: "$total_usage",
            chemicals: "$chemicals",
            "total": {$sum: {$slice : ["$total_usage", from, to]}}
            }
          },
          {$match: {
            "total": {$gt : 0}  // ignore facilities with no usage
            }
          }
        ])
        .sort(
          {total: -1}   // order the facilities by total usage, largest to smallest
        )
        .limit(200)
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data for industries");
            res.json(data);
    });
};

/*
    Return a list of unique industries
    Route:  /data/industries
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
    Return a list of industry sectors and their total aggregate usage
      (sorted largest to smallest by total usage over time)
    Route:  /data/industries/usage/total
*/
exports.industriesTotalUsage = function(req, res, next) {
    var from = (req.query.from) ? req.query.from - 1986 : 0,
      to = (req.query.to) ? (req.query.to - 1986) : 27;

    // ensure range bounds for usage are reasonable
    if( from < 0 || from > 27) from = 0;
    if( to <= from || to > 27) to = 27;
    to = to - from;

    Facility
        .aggregate([
          {$project: {
              primary_naics: 1, primary_sic: 1,
              tri_facility_id: 1,
              "usage": {$sum: {$slice : ["$total_usage", from, to]}}
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
    Return a list of industries and their yearly aggregate usage for the specified array of chemical IDs
    Route: /data/industries/usage/chemicals/
*/
exports.industriesYearlyTotalChemicalUsage = function(req, res, next) {
  var from = (req.query.from) ? req.query.from - 1986 : 0,
    to = (req.query.to) ? (req.query.to - 1986) : 27,
    chem = (req.query.chems) ? req.query.chems.split(',') : [];

  console.log(from, to);
  // ensure range bounds for usage are reasonable
  if( from < 0 || from > 27) from = 0;
  if( to <= from || to > 27) to = 27;

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
            primary_naics: 1,
            usage: "$chemicals.usage.total_usage", // grab out total usage for each chemical** (depends if we want overall vs breakdown)
          }
        },
        {$group: {
          _id: "$primary_naics",    // group by industry sector
          usage: {$push: "$usage"}  // store all relevant chemical usage from each facility for later aggregation
          }
        }
      ])
      .exec(function (err, data) {
          if (err) return next(err);
          if (!data)
              return next("no data for industries.");

          // compute yearly total usage for the specified chemicals for each industry
          //for each industry
          data.forEach(function(d) {
            d.total = [];
            // initialize total array
            for(var i = 0; i < d.usage[0][0].length; i++ )
              d.total[i] = 0;

            // for each facility's usage
            d.usage.forEach(function(usage) {
              // for each chemical's usage
              usage.forEach(function(usage) {
                // for each year
                for(var i = 0; i < usage.length; i++ )
                  d.total[i] += usage[i];
              });

            });
            delete d.usage;
            d.total = d.total.slice(from, to);
          });

          res.json(data);
  });
};

/*
    Return a list of industry sectors and their yearly total usage
      (ordered from largest to smallest)
    Route:  /data/industries/usage/yearly
*/
exports.industriesYearlyTotalUsage = function(req, res, next) {
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
              "usage_subset": {$slice : ["$total_usage", from, to]},
              "usage": {$sum: {$slice : ["$total_usage", from, to]}}  // facilitate sorting on total usage
            }
          },
          // Group on NAICS code
          {$group: {
             _id: "$primary_naics",
             total: {$sum: "$usage"},
             usage: {$push: "$usage_subset"} // hacky: push all facilities' total usage into group's total usage for later aggregation
           }
          }
        ])
        .sort(
          {total: -1}   // order the sectors by total usage, largest to smallest
        )
        .exec(function(err, data) {
            if (err) return next(err);
            if (!data)
              return next("no data for industries.");

            // compute yearly total usage for each industry
            //for each industry
            data.forEach(function(d) {
              d.total = [];
              // initialize total array
              for(var i = 0; i < d.usage[0].length; i++ )
                d.total[i] = 0;

              // for each facility's usage
              d.usage.forEach(function(usage) {
                // for each year
                for(var i = 0; i < usage.length; i++ )
                  d.total[i] += usage[i];
              });
              delete d.usage;
            });

            res.json(data);
         });
};

/*
    Return a list of all facilities in each industry sector
    Route:  /data/industries/facilities
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

/*
    Return a list of all facilities with treatment methods in the given industry sector
    Route:  /data/industries/naics/:naics/methods
*/
exports.industryMethods = function(req, res, next) {
  Facility
      .aggregate([
        {$match: {
            chemicals: {
               $elemMatch: { methods: {$exists: true} } // find facilities with any treatment method
            },
            primary_naics: +req.params.naics
          }
        },
        {$project:{
            primary_naics: 1,
            tri_facility_id: 1,
            chemicals: {$filter: {  // only project the chemicals with treatment methods
                input: '$chemicals',
                as: 'c',
                cond: { $gte : [ '$$c.methods', null ] }  // aggregation pipeline doesn't have $exists yet
              }
            }
          }
        },
        {$project: {
            primary_naics: 1,
            tri_facility_id: 1,
            // chemicals: 1
            chemicals: "$chemicals.chemical", // create array of treated chemicals
            methods: "$chemicals.methods"     // create an array of method objects (types and totals)
          }
        },
      ])
      .limit(100)
      .exec(function (err, data) {
          if (err) return next(err);
          if (!data)
              return next("no data for treatment methods.");
          res.json(data);
  });
};
