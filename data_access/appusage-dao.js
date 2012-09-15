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

// The module's public API
exports.insertDailyAppUsageRawRecord = insertDailyAppUsageRawRecord;
exports.removeDailyAppUsageRawForDates = removeDailyAppUsageRawForDates;
exports.getDailyAppUsageRecordCount = getDailyAppUsageRecordCount;