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
    coredb = require('../data_access/coredb-api.js'),
    shard_api = require('../data_access/shard-api.js'),
    cost_dao = require('../data_access/cost-dao.js'),
    mrr_api = require('../data_access/mrr-api-old.js'),
    appusage_dao = require('../data_access/appusage-dao.js');

/**
* Fixed amount - assume the system will scale and always have 20% headroom when calculating TCO
*/
var TRAFFIC_CAPACITY = .8;

var tcoJob = function () {
    async.series([
        function (callback) {  // ETL STEP 1: Shards
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
        function (callback) { // ETL STEP 2: Customers
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
        function (callback) {  // ETL STEP 3: Keywords
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
                            else {
                                logger.info('No keywords found for: ' + customer.name);
                                callback_inner();
                            }
                        } // end else
                    }); // end getCustomerKeywordCount
                }, // end async.forEach
                function (err) { // callback_inner
                    if (err) {
                        callback(err);
                    }
                    else {
                        logger.info('TCO job step 3: [keyword counts] completed');
                        callback();
                    }
                }); // end async Callback
            }); // end getAllCustomers
        },
        function (callback) {  // ETL STEP 4: Traffic
            customer_dao.getAllCustomers(function (err, customers) {
                if (err) {
                    callback(err);
                }
                async.forEach(customers, function (customer, callback_inner) {
                    async.forEach(customer.organizations, function (organization, callback_inner2) {
                        shard_dao.getShard(organization.shardConfigurationId, function (err, shard) {
                            shard_api.getTrafficCounts(shard.connectionString, organization, function (err, org) {
                                for (var i = 0; i < customer.organizations.length; i++) {
                                    if (customer.organizations[i].id == parseInt(org.id)) {
                                        customer.organizations[i].visitors = org.visitors;
                                        customer.organizations[i].visits = org.visits;
                                        customer.organizations[i].pageviews = org.pageviews;

                                        customer.visitors += org.visitors;
                                        customer.visits += org.visits;
                                        customer.pageviews += org.pageviews;
                                    } // end if
                                } // end for
                                callback_inner2();
                            }); // end getTrafficCounts

                        }); // end getShard
                    },
                    function (err) { // callback_inner2
                        // end forEach customer.organizations
                        if (err) {
                            callback_inner(err);
                        }
                        else {
                            // save customer here
                            customer_dao.saveCustomer(customer, function (err) {
                                if (err) {
                                    callback_inner(err);
                                }
                                else {
                                    logger.info('Traffic updated for: ' + customer.name + ' (' + customer.pageviews + ' pageviews)');
                                    callback_inner(err);
                                }
                            });
                        }
                    });
                },
                function (err) { // callback_inner
                    // end forEach customers
                    if (err) {
                        callback(err);
                    }
                    else {
                        logger.info('TCO job step 4: [Traffic counts] completed');
                        callback();
                    }
                });
            }); // end getAllCustomers
        },
        function (callback) { // ETL STEP 5: Costs
            cost_dao.costBackfill(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    logger.info('TCO job step 5: [Costs] completed');
                    callback();
                }
            });
        },
        function (callback) { // ETL STEP 6: Cost breakout
            customer_dao.getSummaryCounts(function (err, counts) {
                cost_dao.getCostSummary(function (err, costs) {
                    customer_dao.getAllCustomers(function (err, customers) {
                        async.forEach(customers, function (customer, callback_inner) {
                            customer.percTraffic = customer.pageviews / counts.pageviews;
                            customer.percSEO = customer.keywords / counts.keywords;
                            customer.tcoTraffic = customer.percTraffic * costs.tcoTraffic * TRAFFIC_CAPACITY;
                            customer.tcoSEO = customer.percSEO * costs.tcoKeywords;
                            customer.tcoTotal = customer.tcoTraffic + customer.tcoSEO;

                            // default all customer netRevenue to their cost. This will be updated in the 
                            // MRR step if a customer has MRR
                            customer.netRevenue = (-1) * customer.tcoTotal;

                            for (var i = 0; i < customer.organizations.length; i++) {
                                customer.organizations[i].percTraffic = customer.organizations[i].pageviews / counts.pageviews;
                                customer.organizations[i].percSEO = customer.organizations[i].keywords / counts.keywords;
                                customer.organizations[i].tcoTraffic = customer.organizations[i].percTraffic * costs.tcoTraffic * TRAFFIC_CAPACITY;
                                customer.organizations[i].tcoSEO = customer.organizations[i].percSEO * costs.tcoKeywords;
                                customer.organizations[i].tcoTotal = customer.organizations[i].tcoTraffic + customer.organizations[i].tcoSEO;
                            }
                            customer_dao.saveCustomer(customer, function (err) {
                                if (err) {
                                    callback_inner(err);
                                }
                                else {
                                    logger.info('Customer costs updated for: ' + customer.name);
                                    callback_inner();
                                }
                            });
                        },
                        function (err) { // callback_inner
                            if (err) {
                                callback(err);
                            }
                            else {
                                logger.info('TCO job step 6: [Customer costs] completed');
                                callback();
                            }
                        });
                    });
                });
            });
        },
        function (callback) { // ETL STEP 7: MRR
            mrr_api.getMRRData(function (err, mrrData) {
                async.forEach(mrrData, function (mrr, callback_inner) {
                    customer_dao.getCustomerById(mrr[0], function (err, customer) {
                        if (err) {
                            callback_inner(err);
                        }
                        else {
                            if (!customer) {
                                logger.warn('Salesforce data not in core - Salesforce Name: ' + mrr[1] + ', customer_id: ' + mrr[0]);
                                callback_inner();
                            }
                            else {
                                customer.salesforceName = mrr[1];
                                customer.mrr = mrr[2];
                                customer.netRevenue = customer.mrr - customer.tcoTotal;
                                customer_dao.saveCustomer(customer, function (err) {
                                    if (err) {
                                        callback_inner(err);
                                    }
                                    else {
                                        logger.info('MRR updated for: ' + customer.name);
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
                        logger.info('TCO job step 7: [MRR] completed');
                        callback();
                    }

                });
            });
        },
        function (callback) { // ETL STEP 8: Bigscore
            customer_dao.getAllCustomers(function (err, customers) {
                if (err) {
                    callback(err);
                }
                var startDate = Date.today().add({ days: -30 });
                var endDate = Date.today();

                async.forEach(customers, function (customer, callback_inner) {
                    appusage_dao.getBigScoreByCustomerId(customer.id, startDate, endDate, function(err, result) {
                        if (result.length > 0) {
                            customer.bigScore = result[result.length-1]['bigScore'];
                            customer_dao.saveCustomer(customer, function (err) {
                                if (err) {
                                    callback_inner(err);
                                }
                                else {
                                    logger.info('Bigscore updated for: ' + customer.name + ' (' + customer.bigScore + ')');
                                    callback_inner();
                                }
                            });                            
                        }
                        else {
                            callback_inner();
                        }
                    });
                },
                function (err) { // callback_inner
                    if (err) {
                        callback(err);
                    }
                    else {
                        logger.info('TCO job step 8: [Bigscore] completed');
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
