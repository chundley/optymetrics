/**
* Core database access and ETL to create TCO data
*/

var async = require('async'),
    csv = require('csv'),
    pg = require('pg'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    logger = require('../util/logger.js'),
    array_util = require('../util/array_util.js'),
    number_util = require('../util/number_util.js'),
    customer_model = require('./model/customer_model.js'),
    cost_model = require('./model/cost_model.js'),
    cost_dao = require('./cost_dao.js'),
    shard_model = require('./model/shard_model.js'),
    coredb_config = require('config').CoreDb;

/**
* Entry point for a full data backfill. First runs ETL to pull data
* from the core database into MongoDB, including shard_configuration.
* Then pulls usage statistics from the shard databases and finally
* resolves TCO data for all customers and sites
*/
var tcoBackfill = function () {
    async.series([
        function (callback) {
            etlBaselineData(function () {
                callback(null, 'Backfill ETL done');
            });
        },
        function (callback) {
            updateStats(function () {
                callback(null, 'Backfill Stats done');
            });
        }
    ],
    function (err, results) {
        logger.log('info', results[0]);
        logger.log('info', results[1]);
    });
};

/**
* Helper function to support async.forEach to save shards with proper
* callback syntax to notify when all saves are complete
*/
var saveShard = function (shard, callback) {
    shard.save(function (err) {
        if (err) {
            logger.log('error', "Error: " + err);
        }
        else {
            logger.log('info', 'Shard saved: ' + shard.name);
        }
        callback();
    });
}

/**
* Helper function to support async.forEach to save customers with proper
* callback syntax to notify when all saves are complete
*
* NOTE/TODO: in theory these two helper methods could be the same
*/
var saveCustomer = function (customer, callback) {
    customer.save(function (err) {
        if (err) {
            logger.log('error', "Error: " + err);
        }
        else {
        }
        callback();
    });
}

/**
* Gets shard and customer data from core, saves to MongoDB
*/
var etlBaselineData = function (callback) {
    // get shard data from core, clear mongodb collection, save
    async.parallel([
        function (callback) {
            getShards(function (err, shards) {
                mongoose.connection.collections['shards'].drop(function (err) {
                    if (err) {
                        logger.log('error', 'Could not drop shards collection: ' + err);
                    }
                });
                async.forEach(shards, saveShard, function (err) {
                    callback(null, 'ETL step: Shards done');
                });
            });
        },
        function (callback) {
            // get customer data from coredb, clear mongodb collection, save
            getCustomers(function (err, customers) {
                mongoose.connection.collections['customers'].drop(function (err) {
                    if (err) {
                        logger.log('error', 'Could not drop customers collection');
                    }
                });
                async.forEach(customers, saveCustomer, function (err) {
                    callback(null, 'ETL step: Customers done');
                });
            });
        } ],
        function (err, results) {
            logger.log('info', results[0]);
            logger.log('info', results[1]);
            callback();
        }
    );
};

var updateCustomerKeywordCounts = function (customer, callback) {
    customer_model.CustomerModel.findOne({ id: customer.id }, function (err, doc) {
        pg.connect(coredb_config.connectionString, function (err, client) {
            if (err) {
                logger.log('error', err);
            }
            client.query(QUERY_KEYWORDS, [customer.id], function (err, result) {
                if (err) {
                    logger.log('error', 'Error: ' + err);
                }
                if (result.rows.length > 0) {
                    // fetch a row at a time, fire callback when all orgs have been updated for the customer
                    async.forEach(result.rows, function (row, callback) {
                        for (var i = 0; i < customer.organizations.length; i++) {
                            if (customer.organizations[i].id == row.organization_id) {
                                customer.organizations[i].keywords = row.keywords;
                            }
                        }
                        callback();
                    },
                    function () {
                        // all rows have been updated with keyword counts
                        async.forEach(customer.organizations, function (organization, callback) {
                            // update customer with cumulative data, fire callback when all done to trigger a save
                            customer.keywords += organization.keywords;
                            callback();
                        },
                        function () {
                            saveCustomer(customer, function () {
                                // and finally the customer can be saved with all data updated
                                logger.log('info', 'Keyword counts for ' + customer.name + ' updated');
                                callback();
                            });

                        });

                    });
                    
                }
            }); // end query
            callback();
        }); // end pg.connect
    }); // end CustomerModel.findOne
}

var updateCustomerTrafficCounts = function (customer, callback) {
    customer_model.CustomerModel.findOne({ id: customer.id }, function (err, doc) {
        async.forEach(doc.organizations, function (organization, callback) {
            shard_model.ShardModel.findOne({ id: organization.shardConfigurationId }, function (err, shard) {
                pg.connect(shard.connectionString, function (err, client) {
                    client.query(QUERY_VISITORS, [organization.id], function (err, result) {
                        if (err) {
                            logger.log('error', 'Error: ' + err);
                        }
                        else {
                            if (result.rows.length > 0) {
                                for (var i = 0; i < doc.organizations.length; i++) {
                                    if (doc.organizations[i].id == result.rows[0].organization_id) {
                                        doc.organizations[i].visitors = result.rows[0].visitors;
                                        doc.organizations[i].visits = result.rows[0].visits;
                                        doc.organizations[i].pageviews = result.rows[0].pageviews;
                                    }
                                }
                            }
                        } // end else
                        callback();
                    }); // end client.query
                }); // end pg.connect
            }); // end ShardModel.findOne
        },
        function () {
            // all sites should have stats updated, update totals for customer before saving
            async.forEach(doc.organizations, function (organization, callback) {
                doc.visitors += organization.visitors;
                doc.visits += organization.visits;
                doc.pageviews += organization.pageviews;
                callback();
            },
            function () {
                saveCustomer(doc, function () {
                    logger.log('info', 'Traffic counts for ' + customer.name + ' updated');
                    callback();
                });
            });
        });
    }); // end CustomerModel.findOne
}

var updateCustomerCOGS = function (callback) {
    var tcoSEO = 0;
    var tcoTraffic = 0;
    var tcoTotal = 0;

    var totalKeywords = 0;
    var totalTraffic = 0;

    async.series(
    [
        function (callback_inner) {
            cost_model.CostModel.find({}, function (err, docs) {
                async.forEach(docs, function (doc, callback_inner_inner) {
                    tcoSEO += (doc.monthlyCost * doc.percSEO);
                    tcoTraffic += (doc.monthlyCost * doc.percTraffic) * TRAFFIC_CAPACITY;
                    callback_inner_inner();
                },
                function () {
                    callback_inner();
                });
            });
        },
        function (callback_inner) {
            customer_model.CustomerModel.find({}, function (err, docs) {
                async.forEach(docs, function (doc, callback_inner_inner) {
                    totalKeywords += doc.keywords;
                    totalTraffic += doc.pageviews;
                    callback_inner_inner();
                },
                function () {
                    callback_inner();
                });
            });
        },
        function (callback_inner) {
            customer_model.CustomerModel.find({}, function (err, docs) {
                async.forEach(docs, function (doc, callback_inner_inner) {
                    doc.percTraffic = doc.pageviews / totalTraffic;
                    doc.percSEO = doc.keywords / totalKeywords;
                    doc.tcoTraffic = doc.percTraffic * tcoTraffic;
                    doc.tcoSEO = doc.percSEO * tcoSEO;
                    doc.tcoTotal = doc.tcoTraffic + doc.tcoSEO;
                    // set net revenue for all customers to loss at tco total.  This will get corrected later
                    // for those who actually have mrr.  For those who don't it's a net loss
                    doc.netRevenue = (-1) * doc.tcoTotal;
                    for (var i = 0; i < doc.organizations.length; i++) {
                        doc.organizations[i].percTraffic = doc.organizations[i].pageviews / totalTraffic;
                        doc.organizations[i].percSEO = doc.organizations[i].keywords / totalKeywords;
                        doc.organizations[i].tcoTraffic = doc.organizations[i].percTraffic * tcoTraffic;
                        doc.organizations[i].tcoSEO = doc.organizations[i].percSEO * tcoSEO;
                        doc.organizations[i].tcoTotal = doc.organizations[i].tcoTraffic + doc.organizations[i].tcoSEO;
                    }
                    doc.save(function () {
                        callback_inner_inner();
                    });
                },
                function () {
                    callback_inner();
                });
            });
        }
    ],
    function () {
        logger.log('info', 'Total Keywords: ' + number_util.numberFormat(totalKeywords));
        logger.log('info', 'Total Pageviews: ' + number_util.numberFormat(totalTraffic));
        logger.log('info', 'Total SEO Cost: $' + number_util.numberFormat(tcoSEO, 2));
        logger.log('info', 'Total Traffic Cost: $' + number_util.numberFormat(tcoTraffic, 2));
        callback();
    }
    );
}

/**
* Helper function for async.forEach on mrr data
*/
var saveMRR = function (mrr, callback) {
    customer_model.CustomerModel.findOne({ id: mrr[0] }, function (err, doc) {
        if (err) {
            logger.error(err);
            callback(err);
        }
        else if (doc) {
            doc.salesforceName = mrr[1];
            doc.mrr = mrr[2];
            doc.netRevenue = doc.mrr - doc.tcoTotal;
            saveCustomer(doc, function (err) {
                logger.info('MRR saved for customer: ' + doc.name);
                callback(null);
            });

        }
        else {
            logger.warn('No Optify customer id found for Salesforce id: ' + mrr[0] + ',  Customer = ' + mrr[1]);
            callback();
        }
    });
}

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
* Updates MRR for each customer
*
* Right now this is done through a csv export once a month but should be
* automated to pull direct from Salesforce eventually
*
* The spreadsheet is mrr-data.csv and is formatted:
*    {customer_id},{salesforce_name},{mrr}
*/
var updateCustomerMRR = function (callback) {
    var mrrData = [];
    csv().fromPath('./data_access/data_feed/mrr-data.csv').on("data", function (data, index) {
        mrrData.push(data);
    }).on('end', function (count) {
        cleanMRRData(mrrData, function (newMRRData) {
            async.forEach(newMRRData, saveMRR, function (err) {
                logger.info('MRR found for ' + newMRRData.length + ' customers');
                callback();
            });
        });

    }).on('error', function (err) {
        logger.error('END ' + err);
    });
}

/**
* Updates organizations (sites) with COGS data
*/
var updateStats = function (callback) {
    customer_model.CustomerModel.find({}, function (err, docs) {
        async.series(
            [
                function (callback_inner) {
                    async.forEach(docs, updateCustomerKeywordCounts, function (callback) {
                        logger.log('info', 'All keyword counts updated');
                        callback_inner();
                    });
                },
                function (callback_inner) {
                    async.forEach(docs, updateCustomerTrafficCounts, function () {
                        logger.log('info', 'All traffic counts updated');
                        callback_inner();
                    });
                },
                function (callback_inner) {
                    cost_dao.costBackfill('./data_access/data_feed/costs-data.csv', function () {
                        logger.log('info', 'Cost baseline data updated');
                        callback_inner();
                    });
                },
                function (callback_inner) {
                    updateCustomerCOGS(function () {
                        logger.log('info', 'Customer COGS updated');
                        callback_inner();
                    });
                },
                function (callback_inner) {
                    updateCustomerMRR(function () {
                        logger.log('info', 'Customer MRR updated');
                        callback_inner();
                    });
                }
            ],
            function () {
                logger.log('info', 'TCO data refresh complete');
            }
        );
    });
}

/**
* Queries core for shard data, returns array of ShardModel
*/
var getShards = function (callback) {
    pg.connect(coredb_config.connectionString, function (err, client) {
        if (err) {
            logger.log('error', err);
        }

        client.query(QUERY_SHARDS, function (err, result) {
            if (err) {
                logger.log('error', 'Error: ' + err);
            }
            else {
                var shards = [];
                for (var row = 0; row < result.rows.length; row++) {
                    formatShardConnectionString(result.rows[row].db_jdbc_url, result.rows[row].db_user, result.rows[row].db_password, function (connectionString) {
                        var shardmodel = new shard_model.ShardModel({
                            id: result.rows[row].id,
                            name: result.rows[row].short_name,
                            connectionString: connectionString,
                            user: result.rows[row].db_user,
                            password: result.rows[row].db_password,
                            disabled: result.rows[row].disabled
                        });
                        shards.push(shardmodel);
                    });
                }
                callback(err, shards);
            }
        });
    });
};

/**
* Formats the jdbcUrl string we store for shard connections into a standard
* postgres connection string
*
* Turns this: jdbc:postgresql://localhost:5432/lt_optifydb3?prepareThreshold=1000000000
* into this:  postgres://user:password@localhost:5432/lt_optifydb3
*
* This may be better served in another util library
*/
var formatShardConnectionString = function (jdbcUrl, user, password, callback) {
    callback('postgres://' + user + ':' + password + '@' + jdbcUrl.match(/(\/\/)(.*)(?=\?)/)[2]);
};

/**
* Queries core for customer data, returns array of CustomerModel
*/
var getCustomers = function (callback) {
    pg.connect(coredb_config.connectionString, function (err, client) {
        if (err) {
            logger.log('error', err);
        }

        client.query(QUERY_CUSTOMERS, function (err, result) {
            if (err) {
                logger.log('error', 'Error: ' + err);
            }
            else {
                var customers = {};
                var customermodel;
                for (var row = 0; row < result.rows.length; row++) {
                    if (!(result.rows[row].id in customers)) {
                        customermodel = new customer_model.CustomerModel({
                            'id': result.rows[row].id,
                            'name': result.rows[row].name,
                            'createdAt': result.rows[row].created_at,
                            'sku': result.rows[row].display_name,
                            'skuShort': result.rows[row].short_name,
                            'visitors': 0,
                            'visits': 0,
                            'pageviews': 0,
                            'keywords': 0,
                            'percTraffic': 0,
                            'percSEO': 0,
                            'tcoTraffic': 0,
                            'tcoSEO': 0,
                            'tcoTotal': 0,
                            'salesforceName': 'n/a',
                            'mrr': 0,
                            'netRevenue': 0,
                            'organizations': []
                        });
                        customers[result.rows[row].id] = customermodel;
                    }

                    organizationmodel = new customer_model.OrganizationModel({
                        'id': result.rows[row].org_id,
                        'name': result.rows[row].org_name,
                        'createdAt': result.rows[row].org_created_at,
                        'siteDomain': result.rows[row].domain,
                        'disabled': result.rows[row].disabled,
                        'shardConfigurationId': result.rows[row].shard_configuration_id,
                        'visitors': 0,
                        'visits': 0,
                        'pageviews': 0,
                        'keywords': 0,
                        'percTraffic': 0,
                        'percSEO': 0,
                        'tcoTraffic': 0,
                        'tcoSEO': 0,
                        'tcoTotal': 0
                    });
                    customers[result.rows[row].id].organizations.push(organizationmodel);
                }
                // push last one on to the array or it'll be left out
                //customers.push(customermodel);
                debugger;
                callback(err, array_util.hashToArray(customers));
            }
        });
    });
};

/**
* Public API
*/
exports.tcoBackfill = tcoBackfill;

/**
* Fixed amount - assume the system will scale and always have 20% headroom
*/
var TRAFFIC_CAPACITY = .8;

/**
* Query "constants"
*/
var QUERY_SHARDS =  "select distinct " +
                        "sc.id, " +
                        "sc.short_name, " +
                        "sc.db_jdbc_url, " +
                        "sc.db_user, " +
                        "sc.db_password, " +
                        "sc.disabled " +
                    "from shard_configuration sc " +
                    "inner join organization o on sc.id = o.shard_configuration_id";

var QUERY_CUSTOMERS =   "select " +
                            "c.id, " +
                            "c.name, " +
                            "c.created_at, " +
                            "sku.display_name, " +
                            "sku.short_name, " +
                            "o.id as \"org_id\", " +
                            "o.name as \"org_name\", " +
                            "o.created_at as \"org_created_at\", " +
                            "o.domain, " +
                            "o.disabled, " +
                            "o.shard_configuration_id " +
                        "from customer c " +
                        "inner join customer_subscription cs on c.current_subscription_id = cs.id " +
                        "inner join subscription_sku sku on cs.subscription_sku_id = sku.id " +
                        "inner join organization o on c.id = o.customer_id " +
                        "where sku.short_name not like '%dormant' " +
                        "and o.name != 'OPTIFY_SANITY-TEST' " +
                        "and o.disabled = false " +
                        "and c.name != 'Hanegev' " +
                        "order by c.id, o.id";

var QUERY_ORGS =    "select " +
                        "id, " +
                        "name, " +
                        "created_at, " +
                        "domain, " +
                        "customer_id, " +
                        "pageview_processing, " +
                        "ignore_all_pageviews, " +
                        "disabled, " +
                        "shard_configuration_id " +
                    "from organization " +
                    "where name != 'OPTIFY-SANITY-TEST'";

var QUERY_KEYWORDS =    "select " +
                            "key.organization_id, " +
                            "count(key.keyword_id) as \"keywords\" " +
                        "from organization_keyword key " +
                        "inner join organization o on key.organization_id = o.id " +
                        "where o.customer_id = $1 " +
                        "group by key.organization_id";

var QUERY_VISITORS =    "select " +
                             "va.organization_id, " +
                             "count(va.id) as \"visitors\", " +
                             "sum(va.total_visits) as \"visits\", " +
                             "sum(va.total_pageviews) as \"pageviews\" " +
                        "from visitor_aggregate va " +
                        "where va.organization_id = $1 " +
                        "and va.last_visit_date < now() - INTERVAL '1 DAY' and va.last_visit_date  >= now() - INTERVAL '31 DAY' " +
                        "group by va.organization_id";
