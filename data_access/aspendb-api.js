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
    aspen_queries = require('./aspen-queries.yaml'),
    appUsageDao = require('./appusage-dao.js');

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
        logger.log('info', "Pulling monthly customer stats from db.");

        client.query(aspen_queries[0].MonthlyCustomerStats, function (err, result) {
            if (err) {
                logger.log('error', 'Error: ' + err);
            }
            else {
                for (var row = 0; row < result.rows.length; row++) {
                    appUsageDao.upsertMonthlyCustomerStats({
                        monthOf    : result.rows[row].the_month,
                        sku        : result.rows[row].sku,
                        customerCount    : result.rows[row].customer_count
                    }, function(err){
                        if(err)
                            logger.log('error', 'Unable to upsertMonthlyCustomerStats');
                    } );

                }
                logger.log('info', "Completed pulling monthly customer stats from db.");
                callback(err);
            }
        });
    });
};


var backfillWeeklyCustomerUserStats = function (callback) {
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
        logger.log('info', "Pulling weeky customer user stats from db.");
        client.query(aspen_queries[0].WeeklyCustomerUserStats, function (err, result) {
            if (err) {
                logger.log('error', 'Error: ' + err);
            }
            else {
                for (var row = 0; row < result.rows.length; row++) {
                    appUsageDao.upsertWeeklyCustomerUserStats({
                        weekOf    : result.rows[row].week_of
                        , sku        : result.rows[row].sku
                        , customerCount    : result.rows[row].customer_count
                        , userCount    : result.rows[row].user_count
                        , totalDailyVisits    : result.rows[row].total_daily_visits
                    }, function(err){
                        if(err)
                            logger.log('error', 'Unable to upsert WeeklyCustomerUserStats');
                    } );

                }
                logger.log('info', "Completed pulling WeeklyCustomerUserStats from db.");
                callback(err);
            }
        });
    });
};

exports.backfillMonthlyCustomerStats = backfillMonthlyCustomerStats;
exports.backfillWeeklyCustomerUserStats = backfillWeeklyCustomerUserStats;

