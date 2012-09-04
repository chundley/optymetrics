/**
* Job for refreshing Vendor cost data
*/

/**
* node.js libraries
*/
var async = require('async');

/**
* Local project libraries
*/
var logger = require('../util/logger.js'),
    vendorCostApi = require('../data_access/vendor-cost-api.js'),
    vendorCostDao = require('../data_access/vendor-cost-dao.js');

var vendorCostJob = function () {
    vendorCostApi.getVendorData(function (err, vendorData) {
        if (err) {
            logger.error(err);
        }
        else {
            vendorCostDao.vendorCostBackfill(vendorData, function callback(err) {
                if (err) {
                    logger.error(err);
                }
                else {
                    logger.info('Vendor cost backfill complete');
                }
            });
        }
    });
}

exports.vendorCostJob = vendorCostJob;
