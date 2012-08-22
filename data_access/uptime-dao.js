/**
* Access for reporting on Uptime data
*/

var async = require('async'),
    mongoose = require('mongoose'),
    logger = require('../util/logger.js'),
    uptime_model = require('./model/uptime-model.js');

/**
* Parse results from a call to Pingdom's API to get uptime for
* a monitored web site or service endpoint
*
* Note that this depends on them not changing their API (duh)
*/
var saveUptimeStats = function (data, monitorName, callback) {
    async.forEach(data.summary.days, function (day, callback_inner) {
        var dateFormatted = new Date(0);
        dateFormatted.setUTCSeconds(day.starttime);
        uptime_model.UptimeModel.findOne({ 'monitorName': monitorName, 'monitorDate': dateFormatted }, function (err, doc) {
            if (err) {
                callback_inner(err);
            }
            else {
                if (doc) {
                    // found, so just update
                    doc.avgResponse = day.avgresponse;
                    doc.uptime = day.uptime;
                    doc.downtime = day.downtime;
                    doc.unmonitored = day.unmonitored;
                    doc.save(function () {
                        if (err) {
                            callback_inner(err);
                        }
                        callback_inner(null);
                    });
                }
                else {
                    // new data for this monitor, save new document
                    var model = new uptime_model.UptimeModel({
                        monitorName: monitorName,
                        monitorDate: dateFormatted,
                        avgResponse: day.avgresponse,
                        uptime: day.uptime,
                        downtime: day.downtime,
                        unmonitored: day.unmonitored
                    });
                    model.save(function () {
                        if (err) {
                            callback_inner(err);
                        }
                        callback_inner(null);
                    });
                }
            }
        });
    },
    function (err) {
        callback(err);
    });
};

exports.saveUptimeStats = saveUptimeStats;
