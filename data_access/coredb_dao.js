// Core postgres database access

var async = require('async'),
    pg = require('pg'),
    mongo_config = require('config').Mongo,
    mongoose = require('mongoose'),
    _ = require('underscore'),
    logger = require('../util/logger.js'),
    customer_model = require('./model/customer_model.js'),
    shard_model = require('./model/shard_model.js'),
    coredb_config = require('config').CoreDb;

var customerBackfill = function () {
    async.series({
        allshards: function (callback) {
            getShards(function (err, shards) {
                (err) ? callback(err) : callback(err, shards);
            });
        },
        allcustomers: function (callback) {
            getCustomers(function (err, customers) {
                (err) ? callback(err) : callback(err, customers);
            });
        }
    },
    function (err, results) {
        if (err) {
            logger.log('error', 'Customer backfill failed: ' + err);
        }
        else {
            // save shards
            mongoose.connection.collections['shards'].drop(function (err) {
                if (err) {
                    logger.log('error', 'Could not drop shards collection');
                }
            });

            _.each(results['allshards'], function (shard) {
                shard.save(function (err) {
                    if (err) {
                        logger.log('error', "Error: " + err);
                    }
                    else {
                        logger.log('info', 'Shard saved: ' + shard.short_name);
                    }
                });
            });

            // save customers
            mongoose.connection.collections['customers'].drop(function (err) {
                if (err) {
                    logger.log('error', 'Could not drop customers collection');
                }
            });
            _.each(results['allcustomers'], function (customer) {
                customer.save(function (err) {
                    if (err) {
                        logger.log('error', "Error: " + err);
                    }
                    else {
                        logger.log('info', 'Customer saved: ' + customer.name);
                    }
                });
            });
        }
    })
};

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
                var customers = [];
                var customermodel; // = new customer_model.CustomerModel();
                var currentCustomerId = 0;
                for (var row = 0; row < result.rows.length; row++) {
                    if (result.rows[row].id != currentCustomerId) {
                        if (currentCustomerId > 0) {
                            customers.push(customermodel);
                        }
                        currentCustomerId = result.rows[row].id;
                        customermodel = new customer_model.CustomerModel({
                            'id': result.rows[row].id,
                            'name': result.rows[row].name,
                            'createdAt': result.rows[row].created_at,
                            'sku': result.rows[row].display_name,
                            'skuShort': result.rows[row].short_name,
                            'organizations': []
                        });
                    }

                    organizationmodel = new customer_model.OrganizationModel({
                        'id': result.rows[row].org_id,
                        'name': result.rows[row].org_name,
                        'createdAt': result.rows[row].org_created_at,
                        'siteDomain': result.rows[row].domain,
                        'disabled': result.rows[row].disabled,
                        'shardConfigurationId': result.rows[row].shard_configuration_id
                    });
                    customermodel.organizations.push(organizationmodel);
                }
                // push last one
                customers.push(customermodel);
                callback(err, customers);
            }
        });
    });
};

// public API
exports.customerBackfill = customerBackfill;

// query "constants"
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
                        "and c.name != 'Hanegev' " +
                        //"and c.name = '110 Consulting' " +
                        "order by c.name, o.name";

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
