var mongoose = require('mongoose'),
    Facility = mongoose.model('Facility'),
    jsdom = require('jsdom'),
    d3 = require('d3');

/*
  Set up a mongodb query object
*/
var makeFilter = function(query) {

  // list of valid attributes to filter the query on
  /*
    tri_facility_id   : id    = ""
    facility_name     : name  = ""
    state             : state = ""
    bia_code          : bia   = ""
    tribe             : tribe = ""
    primary_naics     : industry  = ""
    chemicals         : chemicals = [" ", " "]
  */
  // keys: query variables
  // values: model attributes
  var propertyConversion = {
    "id": "tri_facility_id",
    "name": "facility_name",
    "state": "state",
    "bia": "bia_code",
    "tribe": "tribe",
    "primary_naics": "industry",
    "chemicals": "chemicals"
  };
  // object to populate with filters
  var dbQuery = {};

  // iterate over all query variables
  for (var propName in query) {
    // only add query filters if relevant attributes
    if (query.hasOwnProperty(propName) && propertyConversion[propName] !== undefined) {
        // console.log(propName, query[propName]);
        dbQuery[propName] = query[propName];
    }
  }

  // console.log(dbQuery);
  return dbQuery;
};

var makePipeline = function(query) {
  var matchCriteria = {}, projection = {}, pipeline;

  var propertyConversion = {
    "id": "tri_facility_id",
    "name": "facility_name",
    "state": "state",
    "bia": "bia_code",
    "tribe": "tribe",
    "industry": "primary_naics",
    "chemicals": "chemicals"
  };

  projection = {
    "tri_facility_id": 1,
    "facility_name": 1,
    "state": 1,
    "bia": 1,
    "tribe": 1,
    "primary_naics": 1,
    "chemicals": 1,
    "loc": 1,
    total: {$sum: "$total_usage"}
  };

  // iterate over all query variables
  for (var propName in query) {
    // only add query filters if relevant attributes
    if (query.hasOwnProperty(propName) && propertyConversion[propName] !== undefined) {
        // console.log(propName, query[propName]);
        if(propName == "chemicals")
          console.log("CHEMICALS");
        else if(propName == "industry")
          matchCriteria[propertyConversion[propName]] =  {$regex: new RegExp('^' + query[propName])};
        else
        matchCriteria[propertyConversion[propName]] = query[propName];
    }
  }

  pipeline = [
    {
      $match: matchCriteria
    },
    {
      $project: projection
    },
    {
      $sort: { "total": -1 }
    },
    {
      $limit : (query.limit) ? +query.limit : 100
    },
    {
      $skip : (query.skip) ? +query.skip : 0
    }
  ];
  // console.log(pipeline);
  return pipeline;
};


/************************************************

    Views for Facility queries

************************************************/

/*
    Generate a visualization for a particular facility
    (Render html)
*/
exports.showFacility = function(req, res, next) {
    var pipeline = makePipeline(req.query);

    Facility
        .aggregate(pipeline)
        .exec(function (err, data) {
          if (err) return next(err);
          if (!data)
            res.render("index", {error: "no data for facility with facility id " + req.params.fid});
          if (data.length != 1)
            res.render("index", {error: "invalid query or filters for single facility. Try the following:  /facility?id=XXXX"});

          res.render("facility", {facility: data[0]});
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
      Filtered for the given attributes
    Route: /data/facilities/filter
*/
exports.filter = function(req, res, next) {
    var limit = (req.query.limit) ? +req.query.limit : 100,
        skip = (req.query.skip) ? +req.query.skip : 0;

    // var query = makeFilter(req.query);

    // Facility
    //     .find(query)
    //     .sort( { facility_name: 1 } )
    //     .skip(skip)
    //     .limit(limit)
    //     .exec(function (err, data) {
    //         if (err) return next(err);
    //         if (!data)
    //             return next("no data");
    //         res.json(data);
    // });

    var pipeline = makePipeline(req.query);

    Facility
        .aggregate(pipeline)
        .exec(function (err, data) {
          if (err) return next(err);
          if (!data)
              return next("no data for facility with facility id " + req.params.fid);
          res.json(data);
        });
};


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
  var from = (req.query.from) ? req.query.from - 1987 : 0,
    to = (req.query.to) ? (req.query.to - 1987) : 27,
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

/*
    Return a list of top treatment method counts
    Route: /data/methods/
*/
exports.methods = function(req, res, next) {
  Facility
      .aggregate([
        {$match: {
            chemicals: {
               $elemMatch: {
                 methods: {$exists: true}
               }
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

/*
    Return a list of top treatment method counts ??FILTERED FOR CHEMICAL AND FOR METHOD??
    Route: /data/methods/cas/:cas/count
*/
exports.methodCount = function(req, res, next) {
  // var chem = (req.query.chems) ? req.query.chems.split(',') : [],
      var methods = (req.query.methods) ? req.query.methods.split(',') : [];
      naics = (req.query.naics) ? req.query.naics : "";

  chem = [req.params.cas];
  methods = ["A03"];

  Facility
      .aggregate([
        {$match: {
          primary_naics: {$regex: new RegExp('^' + naics)},
          chemicals: {
             $elemMatch: { $and: [
               {chemical : {$in : chem }},  // find facilities with the specified chemicals
               {'methods.method': {$in : methods }}   // AND with any treatment method
             ]
             }
           }
         }
        },
        {$project:{
            primary_naics: 1,
            tri_facility_id: 1,
            chemicals: {$filter: {  // only project the relevant chemicals
                input: '$chemicals',
                as: 'c',
                // cond: { $and: [
                //   {$in : ['$$c.chemical', chem ] },           // filter data for specified chemicals
                //   {$filter: {
                //       input: '$$c.methods',
                //       as: 'm',
                //       cond: {$in : ['$$m.method', methods ] }  // AND specified any treatment method
                //       }
                //     }
                // ]
                cond: {$in : ['$$c.chemical', chem ] }
              }
            }
          }
        },
        {$project: {
            primary_naics: 1,
            tri_facility_id: 1,
            // chemicals: 1
            chemicals: "$chemicals.chemical",
            total: "$chemicals.usage.total_usage",
            methods: "$chemicals.methods"
          }
        },
      ])
      .limit(1000)
      .exec(function (err, data) {
          if (err) return next(err);
          if (!data || data.length === 0) {
            //  res.writeHead(200);
            //  return res.end;
            return next("no data for treatment methods.");
          }

          // total method count
          totalMethodCount = [];
          for(var i = 0; i < data[0].total[0].length; i++ )
            totalMethodCount[i] = 0;

          // compute yearly method count for the specific chemicals for each facility
          // for each facility
          data.forEach(function(d) {
            d.methodCount = [];
            // initialize total array
            for(var i = 0; i < d.total[0].length; i++ )
              d.methodCount[i] = 0;

            // for each chemical's usage
            d.methods.forEach(function(m) {
              m.forEach(function(methods) {
                  if(methods.method == "A03") {   // hacky, doesn't consider multiple chems
                    // for each year
                    for(var i = 0; i < methods.count.length; i++ ) {
                      d.methodCount[i] += methods.count[i];
                      totalMethodCount[i] += methods.count[i];
                    }
                  }
              });

            });

            // delete d.usage;
            // d.total = d.total.slice(from, to);

          });
          // console.log(totalMethodCount);
          // res.json(data);
          res.json(totalMethodCount);
  });
};
