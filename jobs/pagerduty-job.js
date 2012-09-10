var async = require('async'),
    dateUtil = require('../util/date_util.js'),
    incidentsDao = require('../data_access/incidents-dao.js'),
    logger = require('../util/logger.js'),
    moment = require('moment'),
    pagerduty = require('../data_access/pagerduty-api.js');

/**
 * PagerDuty incident backfill. Pulls the last 30 days of incidents to ensure we have 
 * sufficient overlap between individual runs of the job.
 */
var pagerDutyBackfill = function() {
    async.series([
        function(callback) {
            //pagerduty.insertIncidents(moment().add('days', -30), moment());
            pagerduty.getIncidents(moment().add('days', -30), moment(), function(err, incidents) {
                async.forEach(
                    incidents,  
                    function(incident, iteratorCallback) {
                        incidentsDao.insertIncident(
                            incident.incident_number,
                            dateUtil.convertDateToUTC(new Date(incident.created_on)),
                            dateUtil.convertDateToUTC(new Date(incident.last_status_change_on)),
                            (incident.last_status_change_by) ? incident.last_status_change_by.name : null,
                            (incident.trigger_summary_data) ? incident.trigger_summary_data.subject : null,
                            incident.status,
                            function(err) {
                                if(err) {
                                    logger.log('error', 'Unable to insert incident: ' + err);
                                    iteratorCallback(err);
                                }
                                iteratorCallback();
                            }
                        );
                    },
                    function(err) {
                        (err) ? callback(err) : callback();                    
                    }
                );
            });
        }
    ],
    function(err) {
        if(err) logger.log('error', 'PagerDuty backfill failed: ' + err);
    });
};

exports.pagerDutyBackfill = pagerDutyBackfill;
