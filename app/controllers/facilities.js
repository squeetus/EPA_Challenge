var mongoose = require('mongoose'),
    Facility = mongoose.model('Facility');

exports.facilities = function(req, res, next) {
    var limit = (req.query.limit && req.query.limit < 100) ? req.query.limit : 10,
        chemicals = (req.query.chemicals) ? req.query.chemicals : false,
        skip = (req.query.skip) ? req.query.skip : 0;

    Facility
        .find({

        },
        {
          chemicals: chemicals
        })
        .skip(skip)
        .limit(limit)
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data");
            res.json(data);
    });
};

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
