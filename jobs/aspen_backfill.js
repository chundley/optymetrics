var async = require('async'),
    logger = require('../util/logger.js'),
    aspendb = require('../data_access/aspendb-api.js');

var aspenBackfill = function() {
    logger.log('info','Begin Aspen backfill');
    async.series([
        function(callback) {
            aspendb.backfillMonthlyCustomerStats(function(err) {
                (err) ? callback(err) : callback();
            });
        },
        function(callback) {
            aspendb.backfillWeeklyCustomerUserStats(function(err) {
                (err) ? callback(err) : callback();
            });
        }
    ],
    function(err) {
        logger.log('info','Aspen backfill complete');

        if(err) logger.log('info','Aspen backfill failed: ' + err);            
    });
};

exports.aspenBackfill = aspenBackfill;
