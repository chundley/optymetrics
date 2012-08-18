/**
* Access for reporting on Ops/TCO data
*/

var mongoose = require('mongoose'),
    logger = require('../util/logger.js'),
    customer_model = require('./model/customer_model.js');

/**
* Get TCO data for Customers only by
*
* @param limit  The number of rows to return
*/
var getCustomerTCOData = function (limit, callback) {
    customer_model.CustomerModel
        .find()
        .desc('tcoTotal')
        .limit(limit)
        .run(function (err, customers) {
            if (err) {
                callback(err, null);
            }
            else {
                callback(null, customers);
            }
        });
};

exports.getCustomerTCOData = getCustomerTCOData
