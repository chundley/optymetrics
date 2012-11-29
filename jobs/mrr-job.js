/**
* Job for refreshing MRR data
*/

/**
* node.js libraries
*/
var async = require('async');

/**
* Local project libraries
*/
var logger = require('../util/logger.js'),
    mrr_dao = require('../data_access/mrr-dao.js'),
    mrr_api = require('../data_access/mrr-api.js');


var mrrJob = function () {
    mrr_api.getMRRData(function(err, mrrs) {
        if (err) {
            callback(err);
        }
        else {    
            async.series([
                function (callback) {
                    mrr_dao.saveMRRs(mrrs, function (err) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            logger.info('MRR job step 1: [mrr] completed');
                            callback();
                        }
                    }); 
                },
                function (callback) {
                    mrr_dao.saveMRRChurn(mrrs, function (err) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            logger.info('MRR job step 2: [mrr churn] completed');
                            callback();
                        }
                    });
                }
                ],
                function (err) {
                    if (err) {
                        logger.error(err);
                    }
                    else {
                        logger.info('MRR data refresh complete');
                    }
                });
        }
    });

}

exports.mrrJob = mrrJob;
