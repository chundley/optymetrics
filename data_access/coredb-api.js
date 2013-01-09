/**
* Access to the Optify core database
*/

/**
* node.js libraries
*/
var async = require('async'),
    pg = require('pg'),
    _ = require('underscore');

/**
* Local project libraries
*/
var logger = require('../util/logger.js'),
    shard_model = require('./model/shard-model.js'),
    customer_model = require('./model/customer-model.js'),
    array_util = require('../util/array_util.js');

var coredb_config = require('config').CoreDb;

/**
* Queries for list of shards, returns array of ShardModelETL
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
                        var shardmodel = new shard_model.ShardModelETL({
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
}

/**
* Formats the jdbcUrl string we store for shard connections into a standard
* postgres connection string
*
* Turns this: jdbc:postgresql://localhost:5432/lt_optifydb3?prepareThreshold=1000000000
* into this:  postgres://user:password@localhost:5432/lt_optifydb3
*
* This may be better served in a util library
*/
var formatShardConnectionString = function (jdbcUrl, user, password, callback) {
    callback('postgres://' + user + ':' + password + '@' + jdbcUrl.match(/(\/\/)(.*)(?=\?)/)[2]);
/* Tommy's specific shard code
    var shard_num = jdbcUrl.match(/shard([0-9]+)/)[1];
    var cn_str = 'postgres://' + user + ':' + password + '@localhost:253' + shard_num + "/p_shard" + shard_num;
    callback(cn_str);
//*/
};

/**
* Queries core for customer data, returns array of CustomerModelETL
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
                        customermodel = new customer_model.CustomerModelETL({
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
                            'bigScore': 0,
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
                callback(err, array_util.hashToArray(customers));
            }
        });
    });
};

var getCustomerKeywordCount = function (customer, callback) {
    pg.connect(coredb_config.connectionString, function (err, client) {
        if (err) {
            callback(err, null);
        }
        client.query(QUERY_KEYWORDS, [customer.id], function (err, result) {
            if (err) {
                callback(err, null);
            }
            // fetch a row at a time, fire callback when all orgs have been updated for the customer
            async.forEach(result.rows, function (row, callback_inner) {
                for (var i = 0; i < customer.organizations.length; i++) {
                    if (customer.organizations[i].id == row.organization_id) {
                        customer.organizations[i].keywords = row.keywords;
                    }
                }
                callback_inner();
            },
            function () { // callback_inner
                // all rows have been updated with keyword counts
                async.forEach(customer.organizations, function (organization, callback_inner) {
                    // update customer with cumulative data, fire callback when all done to trigger a save
                    customer.keywords += organization.keywords;
                    callback_inner();
                },
                function () { // callback_inner
                    callback(null, customer);
                });
            });
        }); // end query
    }); // end pg.connect
};

var getAgencyCustomers = function(callback) {
    pg.connect(coredb_config.connectionString, function (err, client) {
        if (err) {
            callback(err, null);
        }
        client.query(QUERY_AGENCIES, function (err, result) {
            if (err) {
                callback(err, null);
            }
            var customerIds = [];
            async.forEach(result.rows, function (row, callback_inner) {
                customerIds.push(row.customer_id)
                callback_inner();
            },
            function () { // callback_inner
                callback(null, customerIds)
            });
        }); // end query
    }); // end pg.connect
};

exports.getAgencyCustomers = getAgencyCustomers;
exports.getShards = getShards;
exports.getCustomers = getCustomers;
exports.getCustomerKeywordCount = getCustomerKeywordCount;

/**
* Query "constants"
*/
var QUERY_SHARDS = "select distinct " +
                        "sc.id, " +
                        "sc.short_name, " +
                        "sc.db_jdbc_url, " +
                        "sc.db_user, " +
                        "sc.db_password, " +
                        "sc.disabled " +
                    "from shard_configuration sc " +
                    "inner join organization o on sc.id = o.shard_configuration_id";

var QUERY_CUSTOMERS = "select " +
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

var QUERY_AGENCIES = "select distinct ca.customer_id " +
                     "from customer_attribute ca " +
                     "where ca.org_attribute_key_id = 93 " +
                     "and ca.value = 'true'";

var QUERY_ORGS = "select " +
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

var QUERY_KEYWORDS = "select " +
                            "key.organization_id, " +
                            "count(key.keyword_id) as \"keywords\" " +
                        "from organization_keyword key " +
                        "inner join organization o on key.organization_id = o.id " +
                        "where o.customer_id = $1 " +
                        "group by key.organization_id";

