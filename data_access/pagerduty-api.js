/**
 * PagerDuty API client
 */

// Node includes
var async = require('async'),
    rest = require('restler'),
    _ = require('underscore');

// Project includes
var dateUtil = require('../util/date_util.js'),
    logger = require('../util/logger.js'),
    incidentsDao = require('./incidents-dao.js'),
    incidentModel = require('./model/incident-model.js');

var user = 'integrations@optify.net',
    password = '"R:>ga?>KF',
    baseUrl = 'https://optify.pagerduty.com/api/v1/';

/**
 * Builds the API URL for fetching incidents from PagerDuty
 */
var getIncidentUrl = function() {
    return baseUrl + 'incidents';
};

/**
 * Fetches incidents from PagerDuty 
 *
 * @param start     Incidents returned were created after this date
 * @param end       Incidents returend were created before this date
 * @param callback  Success/error callback
 */
var getIncidents = function(start, end, callback) {
    var options = {
        username: user,
        password: password
    };
    var data = {
        since: start,
        until: end
    };
    rest.json(getIncidentUrl(), data, options).on('complete', function(response) {
        callback(null, response.incidents);
    }).on('error', function(err) {
        logger.log('error', 'Unable to fetch incidents from PagerDuty: ' + err);
        callback(err);
    });
};

exports.getIncidents = getIncidents;
