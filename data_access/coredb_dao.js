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
    
var db_conn_str = 'postgres://' + coredb_config.username + ':' + coredb_config.password + '@' + coredb_config.dbHost + ':' + coredb_config.dbPort + '/' + coredb_config.database;

var connect = function () {
    var conn_str = 'mongodb://' + mongo_config.dbHost + ':' + mongo_config.dbPort + '/' + mongo_config.database;
    mongoose.connect(conn_str, function (err) {
        if (err) {
            logger.log('info', 'Error: ' + err);
        } else {
            logger.log('info', 'Connected to MongoDB: ' + conn_str);
        }
    });
};

var disconnect = function () {
    mongoose.disconnect();
};

var customerBackfill = function () {
    async.series({
        allshards: function (callback) {
            getShards(function (err, shards) {
                (err) ? callback(err) : callback(err, shards);
            });
        }
    },
    function (err, results) {
        if (err) {
            logger.log('error', 'Customer backfill failed: ' + err);
        }
        else {
            mongoose.connection.collections['shards'].drop(function (err) {
                if (err) {
                    logger.log('error', 'Could not drop shards collection');
                }
            });

            _.each(results['allshards'], function (shard) {
                var shardmodel = new shard_model.ShardModel({
                    'id': shard.id,
                    'name': shard.short_name,
                    'jdbcUrl': shard.db_jdbc_url,
                    'user': shard.db_user,
                    'password': shard.db_password,
                    'disabled': shard.disabled
                });
                shardmodel.save(function (err) {
                    if (err) {
                        logger.log('error', "Error: " + err);
                    }
                    else {
                        logger.log('info', 'Shard saved: ' + shard);
                    }
                });
            });
        }
    })
};

var getShards = function (callback) {
    pg.connect(db_conn_str, function (err, client) {
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
                    var shard = {
                        id: result.rows[row].id,
                        short_name: result.rows[row].short_name,
                        db_jdbc_url: result.rows[row].db_jdbc_url,
                        db_user: result.rows[row].db_user,
                        db_password: result.rows[row].db_password,
                        disabled: result.rows[row].disabled
                    }
                    shards.push(shard);
                }
                callback(err, shards);
            }
        });
    });
};

var getCustomers = function (callback) {
    pg.connect(db_conn_str, function (err, client) {
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
                    var shard = {
                        id: result.rows[row].id,
                        short_name: result.rows[row].short_name
                    }
                    shards.push(shard);
                }
                callback(err, shards);
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
