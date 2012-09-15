/**
* Access to the Optify aspen database
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
    array_util = require('../util/array_util.js'),
    aspen_queries = require('./aspen-queries.yaml');

var app_config = require('config');
var aspendb_config = null;
if(app_config.AspenDb != null)
    aspendb_config = app_config.AspenDb;


var backfillMonthlyCustomerStats = function (callback) {
    if(aspendb_config == null)
    {
        logger.log('error', "aspen database connection is not available in config");
        callback();
        return;
    }
    pg.connect(aspendb_config.connectionString, function (err, client) {
        if (err) {
            logger.log('error', "No database connection to aspen");
            logger.log('error', err);
            callback();
            return;
        }
        client.query(aspen_queries[0].MonthlyCustomerStats, function (err, result) {
            if (err) {
                logger.log('error', 'Error: ' + err);
            }
            else {
                for (var row = 0; row < result.rows.length; row++) {
                    console.log(result.rows[row]);
                }
                callback(err);
            }
        });
    });
};



exports.backfillMonthlyCustomerStats = backfillMonthlyCustomerStats;


