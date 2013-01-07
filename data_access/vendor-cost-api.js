/**
* Access to Vendor cost data for Optify customers
*
* Right now this is a simple .csv export from SalesForce but
* should be replaced in the future with CRUD capabilities
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
* Gets vendor cost data from the .csv file
*
* The spreadsheet is ./data_access/data_feed/mrr-data.csv and is formatted:
*    {Month},{Vendor},{Amount},{% to SEO},{% to Leads},{% to Email},{% to Overhead},{Notes}
*/
var getVendorData = function (callback) {
    var vendorData = [];
    csv().fromPath('./data_access/data_feed/vendor-data.csv').on("data", function (data, index) {
        var vendor = {
            billingMonth: data[0],
            vendorName: data[1],
            amount: data[2],
            percSEO: data[3],
            percLeads: data[4],
            percEmail: data[5],
            percOverhead: data[6],
            notes: data[7],
            amountSEO: data[2] * data[3],
            amountLeads: data[2] * data[4],
            amountEmail: data[2] * data[5],
            amountOverhead: data[2] * data[6]
        };
        
        vendorData.push(vendor);
    }).on('end', function (count) {
        callback(null, vendorData);
    }).on('error', function (err) {
        callback(err, null);
    });
}

exports.getVendorData = getVendorData;
