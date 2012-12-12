/**
* Access for reporting on Uptime data
*/

var async = require('async'),
    mongoose = require('mongoose'),
    logger = require('../util/logger.js'),
    uptime_model = require('./model/uptime-model.js'),
    _ = require('underscore');

/**
* Get uptime data for a specified monitor, sorted by date descending
* If no monitor name is provided, default to the group of standard
* monitors that account for our overall uptime metric
*
* @param monitorName   The monitor to get uptime stats for
* @param startDate     Start date for uptime statistics
* @param endDate       End date for uptime statistics
*/
var getUptimeData = function (monitorName, startDate, endDate, callback) {
    if (monitorName) {
        uptime_model.UptimeModel
        .find({ 'monitorName': monitorName, monitorDate: { $gte: startDate, $lte: endDate} })
        .sort('monitorDate', -1)
        .exec(function (err, uptimes) {
            if (err) {
                callback(err, null);
            }
            else {
                callback(null, uptimes);
            }
        });
    }
    else {
        // When no monitor name is not provided, use a map/reduce query to get data for all monitors.  This also
        // requires some fudging of the data so it matches the schema of the standard query above
        var map = function () {
            var d = new Date(this.monitorDate);
            d.setHours(0, 0, 0, 0);
            emit(d, { 'monitorDate': d, 'uptime': this.uptime, 'downtime': this.downtime });
        };

        var reduce = function (key, values) {
            var totals = { uptime: 0, downtime: 0, monitorName: 'system uptime', monitorDate: 'x' };
            for (var i in values) {
                totals.uptime += values[i].uptime;
                totals.downtime += values[i].downtime;
                totals.monitorDate = values[i].monitorDate;
            }
            return totals;
        };

        var command = {
            mapreduce: 'uptimes',
            map: map.toString(),
            reduce: reduce.toString(), // map and reduce functions need to be strings
            query: { $or: [{ 'monitorName': 'service' }, { 'monitorName': 'dashboardormaint' }, { 'monitorName': 'landingpages' }, { 'monitorName': 'api'}], monitorDate: { $gte: startDate, $lte: endDate} },
            out: { inline: 1 }
        };

        mongoose.connection.db.executeDbCommand(
        command, function (err, results) {
            if (err) {
                callback(err, null)
            }
            if (results.numberReturned > 0 && results.documents[0].results.length > 0) {
                var ret = [];
                _.each(results.documents[0].results, function (row) {
                    var temp = {
                        monitorName: row.value.monitorName,
                        monitorDate: row.value.monitorDate,
                        uptime: row.value.uptime,
                        downtime: row.value.downtime
                    };
                    ret.push(temp);

                });
                callback(err, ret);
            } else {
                callback(err, []);
            }
        }
    );
    }
};

/**
* Get aggregated uptime data for a specified monitor.
* If no monitor name is provided, default to the group of standard
* monitors that account for our overall uptime metric
*
* @param monitorName   The monitor to get uptime stats for
* @param startDate     Start date for uptime statistics
* @param endDate       End date for uptime statistics
*
* returns {'uptime': 200, 'downtime':10}
*/
var getUptimeDataAggregate = function (monitorName, startDate, endDate, callback) {
    var map = function () {
        emit('uptimes', { 'uptime': this.uptime, 'downtime': this.downtime });
    };

    var reduce = function (key, values) {
        var totals = { uptime: 0, downtime: 0 };
        for (var i in values) {
            totals.uptime += values[i].uptime;
            totals.downtime += values[i].downtime;
        }
        return totals;
    };

    var where = {};
    if (monitorName) {
        where = { 'monitorName': monitorName, monitorDate: { $gte: startDate, $lte: endDate} };
    }
    else {
        where = { $or: [{ 'monitorName': 'service' }, { 'monitorName': 'dashboardormaint' }, { 'monitorName': 'landingpages' }, { 'monitorName': 'api'}], monitorDate: { $gte: startDate, $lte: endDate} };
    }

    var command = {
        mapreduce: 'uptimes',
        map: map.toString(),
        reduce: reduce.toString(), // map and reduce functions need to be strings
        query: where,
        out: { inline: 1 }
    };

    mongoose.connection.db.executeDbCommand(
        command, function (err, results) {
            if (err) {
                callback(err, null)
            }
            if (results.numberReturned > 0 && results.documents[0].results.length > 0) {
                // BUGBUG: this can result in bad things when no data is returned from mapreduce (but results is always returned)
                callback(err, results.documents[0].results[0].value);
            } else {
                callback(err, []);
            }
        }
    );
};

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
                    doc.percUptime = day.uptime / (day.uptime + day.downtime);
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
                        unmonitored: day.unmonitored,
                        percUptime: day.uptime / (day.uptime + day.downtime)
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

exports.getUptimeData = getUptimeData;
exports.getUptimeDataAggregate = getUptimeDataAggregate;
exports.saveUptimeStats = saveUptimeStats;
