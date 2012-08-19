/**
* Access for reporting on Ops/TCO data
*/

var mongoose = require('mongoose'),
    customer_model = require('./model/customer_model.js');

/**
* Get TCO data for Customers only, sorted by total tco descending
*
* @param limit  The number of rows to return
*/
var getCustomerTCOData = function (limit, callback) {
    customer_model.CustomerModel
        .find()
        .select({ 'organizations': 0 })
        .sort('tcoTotal', -1)
        .limit(limit)
        .exec(function (err, customers) {
            if (err) {
                callback(err, null);
            }
            else {
                callback(null, customers);
            }
        });
};

exports.getCustomerTCOData = getCustomerTCOData
