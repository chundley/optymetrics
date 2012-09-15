var async = require('async'),
    logger = require('../util/logger.js'),
    mixpanel = require('../data_access/mixpanel-api.js');

var mixpanelBackfill = function() {
    async.series([
        function(callback) {
            mixpanel.backfillDailyAppUsageRaw(function(err) {
                (err) ? callback(err) : callback();
            });
        },
    ],
    function(err) {
        if(err) logger.log('info','Mixpanel backfill failed: ' + err);            
    });
};

exports.mixpanelBackfill = mixpanelBackfill;
