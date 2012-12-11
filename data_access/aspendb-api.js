/**
* Access to the Optify aspen database
*/

/**
* node.js libraries
*/
var async = require('async'),
    pg = require('pg'),
    moment = require('moment'),
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
        appUsageDao.removeWeeklyCustomerUserStats(function(err){if(err){logger.log('error', "failed in remove weekly customer user stats.");}});
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



var backfillWeeklyFeatureUsageStats = function (callback) {
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
        logger.log('info', "Pulling WeeklyFeatureUsageStats from db.");
        client.query(aspen_queries[0].WeeklyFeatureUsageStats, function (err, result) {
            if (err) {
                logger.log('error', 'Error: ' + err);
            }
            else {
                for (var row = 0; row < result.rows.length; row++) {
                    appUsageDao.upsertWeeklyFeatureUsageStats({
                        feature: result.rows[row].feature
                        , weekNum: result.rows[row].week_num
                        , weekOf: result.rows[row].week_of
                        , weekOfDate: moment(result.rows[row].week_of).toDate()
                        , uniqueUsers: result.rows[row].unique_users
                        , uniqueCustomers: result.rows[row].unique_customers
                        , visits: result.rows[row].visits
                        , timeOnFeature: result.rows[row].time_on_feature
                        , pageviews: result.rows[row].pageviews
                        , percentCustomersUsing: result.rows[row].percent_customers_using
                        , percentUsersUsing: result.rows[row].percent_users_using
                        , percentCustomersUsingExcludeEmail: result.rows[row].percent_customers_using_exclude_email
                        , percentUsersUsingExcludeEmail: result.rows[row].percent_users_using_exclude_email
                        , timeOnfeatureRowNum: result.rows[row].time_on_feature_row_num
                        , pageviewsRowNum: result.rows[row].pageviews_row_num
                        , visitsRowNum: result.rows[row].visits_row_num
                    }, function(err){
                        if(err)
                            logger.log('error', 'Unable to upsert WeeklyFeatureUsageStats');
                    } );

                }
                logger.log('info', "Completed pulling WeeklyFeatureUsageStats from db.");
                callback(err);
            }
        });
    });
};


exports.backfillMonthlyCustomerStats = backfillMonthlyCustomerStats;
exports.backfillWeeklyCustomerUserStats = backfillWeeklyCustomerUserStats;
exports.backfillWeeklyFeatureUsageStats = backfillWeeklyFeatureUsageStats;
