var mongoose = require('mongoose'),
    Chemical = mongoose.model('Chemical');

exports.chemicals = function(req, res, next) {
    var limit = (req.query.limit && req.query.limit < 1000) ? req.query.limit : 10;

    Chemical
        .find({

        })
        .limit(limit)
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data");
            res.json(data);
    });
};

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
