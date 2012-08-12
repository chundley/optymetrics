/**
* Core database access and ETL to create TCO data
*/

var async = require('async'),
    pg = require('pg'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    logger = require('../util/logger.js'),
    array_util = require('../util/array_util.js'),
    customer_model = require('./model/customer_model.js'),
    shard_model = require('./model/shard_model.js'),
    coredb_config = require('config').CoreDb;

/**
* Entry point for a full data backfill. First runs ETL to pull data
* from the core database into MongoDB, including shard_configuration.
* Then pulls usage statistics from the shard databases
*/
var customerBackfill = function () {
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
            logger.log('info', 'Customer saved: ' + customer.name);
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
                    callback(null, 'ETL step 1: Shards done');
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
                    callback(null, 'ETL step 2: Customers done');
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

/**
* Updates organizations (sites) with visitor, visit, and pageview data
*/
var updateStats = function (callback) {
    customer_model.CustomerModel.find({}, function (err, docs) {
        async.forEach(docs, function (customer) {
            async.forEach(customer.organizations, function (organization) {
                // for each organization, get correct shard and update stats
                shard_model.ShardModel.findOne({ id: organization.shardConfigurationId }, function (err, shard) {
                    if (err) {
                        logger.log('error', err);
                    }
                    // from here, update stats for the org, customer, and shard
                    pg.connect(shard.jdbcUrl, function (err, client) {
                        if (err) {
                            logger.log('error', err);
                        }

                        client.query(QUERY_VISITORS, [organization.id], function (err, result) {
                            if (err) {
                                logger.log('error', 'Error: ' + err);
                            }
                            else {
                                if (result.rows.length > 0) {
                                    customer_model.CustomerModel.findOne({ id: customer.id }, function (err, doc) {
                                        for (var i = 0; i < doc.organizations.length; i++) {
                                            if (doc.organizations[i]._id.equals(organization._id)) {
                                                doc.organizations[i].visitors = result.rows[0].visitors;
                                                doc.organizations[i].visits = result.rows[0].visits;
                                                doc.organizations[i].pageviews = result.rows[0].pageviews;

                                                // update customer stats as well
                                                doc.visitors += result.rows[0].visitors;
                                                doc.visits += result.rows[0].visits;
                                                doc.pageviews += result.rows[0].pageviews;

                                                logger.log('info', 'Stats found for site: ' + organization.siteDomain);
                                                break;
                                            }
                                        }
                                        doc.save(function (err) {
                                            if (err) {
                                                logger.log('error', 'Save failed: ' + err);
                                            }
                                            else {
                                                logger.log('info', 'Stats updated for customer: ' + customer.name);
                                            }
                                        });
                                    });
                                }
                            }
                        });
                    });
                });
            });
        });
    });
    callback();
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
                    var shardmodel = new shard_model.ShardModel({
                        id: result.rows[row].id,
                        name: result.rows[row].short_name,
                        jdbcUrl: result.rows[row].db_jdbc_url,
                        user: result.rows[row].db_user,
                        password: result.rows[row].db_password,
                        disabled: result.rows[row].disabled
                    });
                    shards.push(shardmodel);
                }
                callback(err, shards);
            }
        });
    });
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
                //var currentCustomerId = 0;
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
                            'pageviews' : 0,
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
                        'pageviews': 0
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
exports.customerBackfill = customerBackfill;

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
                        //"and c.id = 1 " +
                        //"and c.id in(1, 70) " +
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
                        "where o.disabled = false " +
                        "group by key.organization_id ";

var QUERY_VISITORS =    "select " +
                             "va.organization_id, " +
                             "count(va.id) as \"visitors\", " +
                             "sum(va.total_visits) as \"visits\", " +
                             "sum(va.total_pageviews) as \"pageviews\" " +
                        "from visitor_aggregate va " +
                        "where va.organization_id = $1 " +
                        "and va.last_visit_date < now() - INTERVAL '1 DAY' and va.last_visit_date  >= now() - INTERVAL '31 DAY' " +
                        "group by va.organization_id";
