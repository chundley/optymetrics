/**
 * Access to the incidents (PagerDuty) colleciton in MongoDB
 */

// Node libraries
var mongoose = require('mongoose'),
    _ = require('underscore');

// Project utils
var logger = require('../util/logger.js'),
    incidentModel = require('./model/incident-model.js');

/**
 * Inserts an incident into MongoDB
 * 
 * @param {number}      incidentNumber    PagerDuty internal incident ID
 * @param {date}        createdOn         The date/time the incident was created
 * @param {date}        lastUpdatedOn     The last update datestamp
 * @param {string}      lastUpdatedBy     The last update
 * @param {string}      subject           A description of the alarm
 * @param {string}      status            The incident status
 * @param {function}    callback          Executed when the save operation is complete or an error is encountered
 */
var insertIncident = function(incidentNumber, createdOn, lastUpdatedOn, lastUpdatedBy, subject, status, callback) {
    incidentModel.IncidentModel.findOne({ incidentNumber: incidentNumber }, function(err, doc) {
        if(err) {
            callback(err);
            return;
        }
        if(!doc) {
            debugger;
            logger.log('info', 'Inserting incident number ' + incidentNumber);
            var incident = new incidentModel.IncidentModel({
                incidentNumber: incidentNumber,
                createdOn: createdOn,
                lastUpdatedOn: lastUpdatedOn,
                lastUpdatedBy: lastUpdatedBy,
                subject: subject,
                status: status
            });
            incident.save(function(err) {
                (err) ? callback(err) : callback();
            });
        } else {
            logger.log('info', 'Incident with incident number ' + incidentNumber + ' already exists.');
       }
    });
};

/**
 * Gets incidents between start and end
 *
 * @param {date}      start     The start of the date range
 * @param {date}      end       The end of the date range
 * @param {function}  callback  Callback that will be executed with any results or errors
 */
var getIncidents = function(start, end, callback) {
    incidentModel.IncidentModel.find({ createdOn: { $gte: start, $lte: end } })
        .sort('createdOn', 'descending')
        .execFind(function(err, docs) {
            if(err) { 
                callback(err); 
                return;
            }
            callback(null, docs);
        });
};

/**
 * Gets aggregate count of incidents by day between start and end
 *
 * @param {date}      start     The start date range
 * @param {date}      end       The end date range
 * @param {function}  callback  Callback that will be executed with any results or errors
 */
var getIncidentAggregate = function(start, end, callback) {
    var map = function() {
        var key = new Date(this.createdOn.getFullYear(), this.createdOn.getMonth(), this.createdOn.getDate());
        emit(key, 1);
    };

    var reduce = function(key, values) {
        var count = 0;
        values.forEach(function(value) {
            count++;
        });

        return count;
    };

    var command = {
        mapreduce: 'incidents',
        map: map.toString(),
        reduce: reduce.toString(),
        query: { createdOn: { $gte: start, $lte: end } },
        out: { inline: 1 }
    };

    mongoose.connection.db.executeDbCommand(
        command,
        function(err, results) {
            if(err) {
                logger.log('error', err);
            }
            
            if(results.numberReturned > 0) {
                callback(err, _.map(results.documents[0].results, function(result, key) {
                    return { date: new Date(result._id), count: result.value };
                }));
            } else {
                callback(err, []);
            }
        }
    );
};

exports.insertIncident = insertIncident;
exports.getIncidents = getIncidents;
exports.getIncidentAggregate = getIncidentAggregate;
