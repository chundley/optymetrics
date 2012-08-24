/**
* Job for refreshing TCO data
*/

/**
* node.js libraries
*/
var async = require('async');

/**
* Local project libraries
*/
var logger = require('../util/logger.js'),
    shard_dao = require('../data_access/shard-dao.js'),
    customer_dao = require('../data_access/customer-dao.js'),
    coredb = require('../data_access/coredb-api.js');

var tcoJob = function () {
    async.series([
        function (callback) {
            coredb.getShards(function (err, shards) {
                if (err) {
                    callback(err);
                }
                else {
                    shard_dao.saveShards(shards, function (err) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            logger.info('TCO job step 1: [shards] completed');
                            callback();
                        }
                    });
                }
            });
        },
        function (callback) {
            coredb.getCustomers(function (err, customers) {
                if (err) {
                    callback(err);
                }
                else {
                    customer_dao.refreshAllCustomers(customers, function (err) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            logger.info('TCO job step 2: [customer baseline] completed');
                            callback();
                        }
                    });
                }
            });
        },
        function (callback) {
            // Keyword count update
            customer_dao.getAllCustomers(function (err, customers) {
                if (err) {
                    callback(err);
                }
                async.forEach(customers, function (customer, callback_inner) {
                    coredb.getCustomerKeywordCount(customer, function (err, customer) {
                        if (err) {
                            logger.error(err);
                            callback_inner(err);
                        }
                        else {
                            // only save if they actually had keywords
                            if (customer.keywords > 0) {
                                customer_dao.saveCustomer(customer, function (err) {
                                    if (err) {
                                        callback_inner(err);
                                    }
                                    else {
                                        logger.info('Keyword count updated for: ' + customer.name);
                                        callback_inner();
                                    }
                                });
                            }
                        }
                    });
                },
                function (err) { // callback_inner
                    if (err) {
                        callback(err);
                    }
                    else {
                        logger.info('TCO job step 3: [keyword counts] completed');
                        callback();
                    }
                });

            });
        }
    ],
    function (err) {
        if (err) {
            logger.error(err);
        }
        else {
            logger.info('TCO data refresh complete');
        }
    });
}

exports.tcoJob = tcoJob;
