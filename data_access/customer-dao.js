/**
* Access to customers collection in MongoDB
*/

/**
* node.js libraries
*/
var async = require('async'),
    mongoose = require('mongoose');

/**
* Local project includes
*/
var logger = require('../util/logger.js'),
    customer_model = require('./model/customer-model.js');

/**
* Returns all records in the customers collection
*/
var getAllCustomers = function (callback) {
    customer_model.CustomerModel.find({}, function (err, docs) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, docs);
        }
    });
};

/**
* Completely re-writes the customers collection with the passed in
* set of customers
*/
var refreshAllCustomers = function (customers, callback) {
    async.waterfall([
        function (inner_callback) {
            // drop existing ETL collection (it shouldn't exist, but try anyway)
            mongoose.connection.collections['etlcustomers'].drop(function (err) {
                inner_callback(null);
            });
        },
        function (inner_callback) {
            // save customers to etlcustomers collection
            async.forEach(customers, function (customer, inner_callback2) {
                customer.save(function (err) {
                    if (err) {
                        inner_callback2(err);
                    }
                    else {
                        logger.info('Customer saved: ' + customer.name);
                        inner_callback2(null);
                    }
                });
            },
            function (err) { // inner_callback2
                if (err) {
                    inner_callback(err);
                }
                else {
                    inner_callback(null);
                }
            });
        },
        function (inner_callback) {
            // drop existing shard collection and replace
            mongoose.connection.collections['customers'].drop(function (err) {
                mongoose.connection.collections['etlcustomers'].rename('customers', function (err) {
                    if (err) {
                        // this would be catastrophic - no shards collection at this point
                        inner_callback('Catastrophic failure - no customers collection: ' + err);
                    }
                    else {
                        inner_callback(null);
                    }
                });
            });
        }
    ],
    function (err) { // inner callback
        if (err) {
            callback(err);
        }
        else {
            logger.info('Customers collection successfully updated');
            callback(null);
        }
    });
}

/**
* Saves a single customer to the customers collection
*/
var saveCustomer = function (customer, callback) {
    customer.save(function (err) {
        if (err) {
            callback(err);
        }
        else {
            callback(null);
        }
    });
};

exports.getAllCustomers = getAllCustomers;
exports.refreshAllCustomers = refreshAllCustomers;
exports.saveCustomer = saveCustomer;
