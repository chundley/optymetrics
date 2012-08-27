/**
* Access to MRR data for Optify customers
*
* Right now this is a simple .csv export from SalesForce but
* should be replaced in the future with a real API call
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
* This is a stupid thing to have to do
*
* The MRR csv file contains duplicates and for some reason Mongoose is queuing
* document saves. This causes the last document to win.  This method de-duplicates
* MRR data before attempting to save, otherwise the last document in just
* overwrites the other ones that aren't saved until the end
*/
var cleanMRRData = function (mrr, callback) {
    var newMRR = [];
    _.each(mrr, function (m) {
        // convert to a float, they come in from the csv as strings
        m[2] = parseFloat(m[2]);
        var found = false;
        _.each(newMRR, function (nm) {
            if (m[0] == nm[0]) {
                found = true;
                nm[1] = m[1];
                nm[2] = nm[2] + m[2];
            }
        });
        if (!found) {
            newMRR.push(m);
        }
    });
    callback(newMRR);
};

/**
* Gets MRR data from the .csv file
*
* The spreadsheet is ./data_access/data_feed/mrr-data.csv and is formatted:
*    {customer_id},{salesforce_name},{mrr}
*/
var getMRRData = function (callback) {
    var mrrData = [];
    csv().fromPath('./data_access/data_feed/mrr-data.csv').on("data", function (data, index) {
        mrrData.push(data);
    }).on('end', function (count) {
        cleanMRRData(mrrData, function (newMRRData) {
            callback(null, newMRRData);
        });

    }).on('error', function (err) {
        callback(err, null);
    });
}

exports.getMRRData = getMRRData;
