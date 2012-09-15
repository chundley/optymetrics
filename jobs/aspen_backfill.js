var async = require('async'),
    logger = require('../util/logger.js'),
    mixpanel = require('../data_access/aspendb-api.js');

var aspenBackfill = function() {
    async.series([
        function(callback) {
            mixpanel.backfillMonthlyCustomerStats(function(err) {
                (err) ? callback(err) : callback();
            });
        },
    ],
    function(err) {
        if(err) logger.log('info','Aspen backfill failed: ' + err);            
    });
};

exports.aspenBackfill = aspenBackfill;
