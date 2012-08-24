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
    shard_model = require('./model/shard-model.js');

var coredb_config = require('config').CoreDb;

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
};

exports.getShards = getShards;

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

