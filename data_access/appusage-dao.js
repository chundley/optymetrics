/**
 * Access to stories collection in MongoDB
 * TODO: Split member and list access into separate dao
 */

/**
 * Node libraries
 */
var mongoConfig = require('config'), 
    mongoose = require('mongoose'),
    _ = require('underscore');

/**
 * Project includes
 */
var date_util = require('../util/date_util.js'),
    logger = require('../util/logger.js'),
    appUsageModel = require('./model/appusage-model.js'); 


var insertDailyAppUsageRawRecord = function(data, callback) {
    var dailyAppUsageRawRecord = new appUsageModel.DailyAppUsageRawModel(data);
    dailyAppUsageRawRecord.save(function(err) {
        (err) ? callback(err) : callback(); 
    });
};

var removeDailyAppUsageRawForDates = function(startDate, endDate, callback) {
    appUsageModel.DailyAppUsageRawModel.find({dateOf:{ $gte: startDate, $lte: endDate } } ).remove().exec(function(err){
        callback();
    });
};

var upsertWeeklyCustomerUserStats = function(data, callback) {
    var WeeklyCustomerUserStatsRecord = new appUsageModel.WeeklyCustomerUserStatsModel(data);
    WeeklyCustomerUserStatsRecord.save();
    callback();
};


var upsertMonthlyCustomerStats = function(data, callback) {
    var MonthlyCustomerStatsRecord = new appUsageModel.MonthlyCustomerStatsModel(data);
    MonthlyCustomerStatsRecord.save();
    callback();
};

var upsertWeeklyFeatureUsageStats = function(data, callback) {
    var WeeklyFeatureUsageStatsRecord = new appUsageModel.WeeklyFeatureUsageStatsModel(data);
    WeeklyFeatureUsageStatsRecord.save();
    callback();
};

var getDailyAppUsageRecordCount = function(callback){
  appUsageModel.DailyAppUsageRawModel.find().count().exec(function (err, rec_count) {
      if (err) {
          callback(err, null);
      }
      else {
          callback(null, rec_count);
      }
  });
};

var getMonthlyCustomersBySku = function(callback){
    appUsageModel.MonthlyCustomerStatsModel
        .find()
        .sort("sku",1)
        .sort("monthOf",1)
        .exec(function (err, docs) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, docs);
        }
    });
    
};

var getWeeklyCustomerUserStats = function(callback){
    appUsageModel.WeeklyCustomerUserStatsModel
        .find()
        .sort("sku",1)
        .sort("weekOf",1)
        .exec(function (err, docs) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, docs);
        }
    });
    
};

var getWeeklyFeatureUsageStats = function(callback){
    appUsageModel.WeeklyFeatureUsageStatsModel
        .find()
        .sort("feature",1)
        .sort("weekNum",1)
        .exec(function (err, docs) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, docs);
        }
    });
    
};

// The module's public API
exports.insertDailyAppUsageRawRecord = insertDailyAppUsageRawRecord;
exports.removeDailyAppUsageRawForDates = removeDailyAppUsageRawForDates;
exports.getDailyAppUsageRecordCount = getDailyAppUsageRecordCount;
exports.upsertMonthlyCustomerStats = upsertMonthlyCustomerStats;
exports.getMonthlyCustomersBySku = getMonthlyCustomersBySku;
exports.upsertWeeklyCustomerUserStats = upsertWeeklyCustomerUserStats;
exports.getWeeklyCustomerUserStats = getWeeklyCustomerUserStats;
exports.upsertWeeklyFeatureUsageStats = upsertWeeklyFeatureUsageStats;
exports.getWeeklyFeatureUsageStats = getWeeklyFeatureUsageStats;
