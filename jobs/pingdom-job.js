/**
* Jobs for getting pingdom uptime/downtime stats
*/

var async = require('async'),
    logger = require('../util/logger.js'),
    pingdom = require('../data_access/pingdom-api.js'),
    uptime_dao = require('../data_access/uptime-dao.js');

/**
* Updates the uptime/downtime statistics for pingdom monitors
*
* In parallel, call to the pingdom API for each endpoint we're monitoring
* and either save new data or overwrite existing data
*/
var pingdomJob = function () {
    async.parallel([
        function (callback) {
            pingdom.getServiceUptime(function (err, data) {
                if (err) {
                    callback(err);
                }
                else {
                    uptime_dao.saveUptimeStats(data, 'service', function (err) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            logger.info('Uptime stats saved for service.optify.net');
                            callback();
                        }
                    });
                }
            });
        },
        function (callback) {
            pingdom.getDashboardUptime(function (err, data) {
                if (err) {
                    callback(err);
                }
                else {
                    uptime_dao.saveUptimeStats(data, 'dashboard', function (err) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            logger.info('Uptime stats saved for dashboard.optify.net excluding planned');
                            callback(null);
                        }
                    });
                }
            });
        },
        function (callback) {
            pingdom.getDashboardOrMaintUptime(function (err, data) {
                if (err) {
                    callback(err);
                }
                else {
                    uptime_dao.saveUptimeStats(data, 'dashboardormaint', function (err) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            logger.info('Uptime stats saved for dashboard.optify.net including planned');
                            callback(null);
                        }
                    });
                }
            });
        },
        function (callback) {
            pingdom.getLandingPagesUptime(function (err, data) {
                if (err) {
                    callback(err);
                }
                else {
                    uptime_dao.saveUptimeStats(data, 'landingpages', function (err) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            logger.info('Uptime stats saved for pages.optify.net');
                            callback();
                        }
                    });
                }
            });
        }
    ],
    function (err) {
        if (err) {
            logger.error('Pingdom job failed: ' + err);
        }
        else {
            logger.info('Pingdom job completed');
        }
    });
};

exports.pingdomJob = pingdomJob;
