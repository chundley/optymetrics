/**
* Access to the pingdom API
*
* If we end up adding more monitors in the future it's pretty easy to make
* this dynamic using the base call:  https://api.pingdom.com/api/2.0/checks
*/

var logger = require('../util/logger.js'),
    rest = require('restler');

var baseUrl = 'https://api.pingdom.com/api/2.0/',
    login = 'scottax@optify.net',
    password = 'tiOPTop%',
    appKey = 'jbeel2djd0mfcmptm0hzfhvksco5xg7j';

/**
* Static id's representing pingdom monitor id's
*/
var pingdomId = {
    'service': 115013,
    'dashboard': 113000,
    'maint': 232506,
    'landingpages': 442156,
    'www': 113004,
    'twtelecom': 425959,
    'speakeasy': 198776
}

/**
* Create a Url for pulling uptime data by day
*
* NOTE: temporary parameter to do a longer backfill (180 days available). Once
* backfilled in production the last parameter should be taken off
*/
var getUptimeUrl = function (id) {
    return baseUrl + 'summary.performance/' + id + '?includeuptime=true&resolution=day&from=1329980400';
};

/**
* Generic function to get uptime results data from the API
*/
var getAPIResults = function (url, callback) {
    rest.get(url, {
        username: login,
        password: password,
        headers: { 'App-Key': appKey }
    })
    .on('complete', function (results) {
        if (results instanceof Error) {
            callback(results, null);
        }
        else {
            callback(null, results);
        }
    });
}

/**
* Wrapper for getting uptime for service.optify.net
*/
var getServiceUptime = function (callback) {
    getAPIResults(getUptimeUrl(pingdomId['service']), function (err, results) {
        if (err) { callback(err, null); }
        else { callback(null, results); }
    });
}

/**
* Wrapper for getting uptime for dashboard.optify.net
* Note that this will show downtime for planned downtime
*/
var getDashboardUptime = function (callback) {
    getAPIResults(getUptimeUrl(pingdomId['dashboard']), function (err, results) {
        if (err) { callback(err, null); }
        else { callback(null, results); }
    });
}

/**
* Wrapper for getting uptime for dashboard.optify.net
* Note that this will count planned maintenance as 'uptime'
*/
var getDashboardOrMaintUptime = function (callback) {
    getAPIResults(getUptimeUrl(pingdomId['maint']), function (err, results) {
        if (err) { callback(err, null); }
        else { callback(null, results); }
    });
}

/**
* Wrapper for getting uptime for pages.optify.net
*/
var getLandingPagesUptime = function (callback) {
    getAPIResults(getUptimeUrl(pingdomId['landingpages']), function (err, results) {
        if (err) { callback(err, null); }
        else { callback(null, results); }
    });
}

exports.getServiceUptime = getServiceUptime;
exports.getDashboardUptime = getDashboardUptime;
exports.getDashboardOrMaintUptime = getDashboardOrMaintUptime;
exports.getLandingPagesUptime = getLandingPagesUptime;
