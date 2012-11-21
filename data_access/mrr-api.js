/**
* Access to MRR history data for Optify customers
*
* CSV data from Eli
*/

/**
* node.js libraries
*/
var async = require('async'),
    csv = require('csv'),
    _ = require('underscore');

/**
* Local project libraries
*/
var logger = require('../util/logger.js');

/**
* Gets MRR data from the .csv file
*
* The spreadsheet is ./data_access/data_feed/mrr-data.csv and is formatted:
*    {customer_id},{salesforce_name},{mrr}
*/
var getMRRData = function (callback) {
    var mrrData = [];
    csv().fromPath('./data_access/data_feed/mrr-raw.csv').on("data", function (data, index) {
        mrrData.push(data);
    }).on('end', function (count) {
        callback(null, mrrData);
    }).on('error', function (err) {
        callback(err, null);
    });
}

exports.getMRRData = getMRRData;
