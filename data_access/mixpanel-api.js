/**
 * MixPanel API client
 */

/**
 * Node includes
 */
var async = require('async'),
    rest = require('restler'),
    querystring= require('querystring'),
    md5 = require('md5'),
    date_util = require('date-utils');
    _ = require('underscore');

/**
 * Project includes
 */
var logger = require('../util/logger.js'),
    array_util = require('../util/array_util.js'),
    appUsageDao = require('./appusage-dao.js');

var api_key = '485278082b64f86107b171b280e5c11f',
    api_secret = '671df2f1e9a8f8d5768f16435918a12f',
    baseUrl = 'http://mixpanel.com/api/2.0/';

var getMixpanelUrl = function(endPoint, options){
    options["api_key"] = api_key;
    options["expire"] = Math.round((new Date()).getTime() / 1000 + 120);
    options = array_util.objectKeySort(options);
    var option_arr = [];
    for(var k in options)
        option_arr.push(k + "=" + options[k]);
    option_join = option_arr.join("");
    sig = md5.digest_s(option_join + api_secret);
    var url = baseUrl + endPoint + "?sig=" + sig + "&" + querystring.stringify(options);
    return url;   
};

var processSingleEvent = function(eventName, startDate, endDate, callback)
{
    var url = getMixpanelUrl("segmentation", {event:  eventName
        , from_date: startDate.toFormat("YYYY-MM-DD")
        , to_date: endDate.toFormat("YYYY-MM-DD")
        , type: "general"
        , on: 'properties["app"]+"|"+properties["customer:id"]+"|"+properties["customer:sku"]+"|"+properties["user:id"]'
        , unit: 'day'
        , where: 'string(properties["customer:sku"]) != "undefined" and properties["customer:sku"] != "Free Trial"'
        , limit: 10000
    });

//    logger.log('info', eventName + ' : ' + startDate);
    
    rest.get(url).on('complete', function(results) {
        if(results.data == null)
        {
            logger.log('error', "No data recieved from mixpanel: " + eventName + " - " + startDate + " - " + endDate);
            callback();
            return;
        }
        
        for(var k in results.data.values)
        {
            for(var dateOf in results.data.values[k])
            {
                if(results.data.values[k][dateOf] > 0)
                {
                    key_parts = k.split("|");
                    event_parts = eventName.replace(/:/, "#").split("#");
                    appUsageDao.insertDailyAppUsageRawRecord({
                        app        : key_parts[0],
                        eventApp   : event_parts[0],
                        eventName  : event_parts[1],
                        customerId : key_parts[1],
                        sku        : key_parts[2],
                        userId     : key_parts[3],
                        dateOf     : dateOf,
                        eventCount : results.data.values[k][dateOf]
                    }, function(err){
                        if(err)
                            logger.log('error', 'Unable to insert DailyAppUsageRawRecord');
                    } );
                }
            }
        }
        callback(null);
    });
};

var backfillDailyAppUsageRaw = function(callback){
    logger.log('info','Backfill raw daily app usage: Start');
    var startDate = (new Date()).add({days:-30});
    var endDate = (new Date()).add({days:0});

    async.series([
      function(callback){
          appUsageDao.getDailyAppUsageRecordCount(function (err, recCount) {
              if(recCount > 0)
                  startDate = (new Date()).add({days:-16});
              callback();
          });
      }
      , function(callback){
          appUsageDao.removeDailyAppUsageRawForDates(startDate, endDate, function(){
              logger.log('info', 'Completed removal of data for dates: ' + startDate.toFormat("YYYY-MM-DD") + " to " + endDate.toFormat("YYYY-MM-DD"));
              callback();
          });
      }
      , function(callback){
          var url = getMixpanelUrl("events/names", {type: 'unique',limit: 5000});
          rest.get(url).on('complete', function(results) {
              var all_events_days = [];
              var curDate = (new Date()).add({days:-16});
              while(curDate < endDate){
                  for(var i in results){
                    all_events_days.push( {"startDate":curDate.clone(), "endDate": curDate.clone().addDays(1), "eventName":results[i]} );
                  }
                  curDate.addDays(1);
              }
              logger.log("info", "total event days: " + all_events_days.length);
              async.forEachSeries(all_events_days, function(event_day, callback){
                processSingleEvent(event_day.eventName, event_day.startDate, event_day.endDate, callback);
              });
              logger.log('info','done adding mixpanel events');
          });
      }
    ], function(err){
        if(err){
            callback(err);
        }
        logger.log('info','Backfill raw daily app usage: Complete');
    });
    callback();
};


exports.backfillDailyAppUsageRaw = backfillDailyAppUsageRaw;
