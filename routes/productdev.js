var storyDao = require('../data_access/story-dao.js'),
    appUsageDao = require('../data_access/appusage-dao.js'),
    logger = require('../util/logger.js'),
    date_util = require('../util/date_util.js');

exports.velocityByFeatureGroup = function(req, res, next) {
    var startDate = new Date(parseInt(req.query['start']));
    var endDate = new Date(parseInt(req.query['end']));
    
    storyDao.getPointsByFeatureGroup(startDate, endDate, function(err, results) {
        if(err) {
            logger.log('error', err);
            res.statusCode = 500;
            res.send('InternalServerError');
            return;
        }
        res.send(results);
    });
};

exports.stories = function(req, res, next) {
    var startDate, endDate, featureGroup;
    if(req.query['start']) {
        startDate = new Date(parseInt(req.query['start']));
    }
    if(req.query['end']) {
        endDate = new Date(parseInt(req.query['end']));
    }
    if(req.query['fg']) {
        featureGroup = req.query['fg'];
    }

    storyDao.getStories(startDate, endDate, featureGroup, function(err, results) {
        if(err) {
            logger.log('error', err);
            res.statusCode = 500;
            res.send('InternalServerError');
            return;
        }
        res.send(results);
    });
};

exports.velocityByWeek = function(req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));
    
    storyDao.getDeploymentVelocity(startDate, endDate, function(err, results) {
         if(err) {
            logger.log('info',err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
};

exports.velocityTrend = function(req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));
    
    storyDao.getVelocityTrend(startDate, endDate, function(err, results) {
         if(err) {
            logger.log('info',err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
};

exports.averageCycleTime = function(req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));
    
    storyDao.getCycleTimeOverPeriod(startDate, endDate, function(err, results) {
         if(err) {
            logger.log('info',err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(results);
    });
};

exports.weeklyCustomerUserStats = function (req, res, next) {
    appUsageDao.getWeeklyCustomerUserStats(function (err, weeklyData) {
         if(err) {
            logger.log('info',err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(weeklyData);
    });
};

exports.weeklyFeatureUsageStats = function (req, res, next) {
    appUsageDao.getWeeklyFeatureUsageStats(function (err, weeklyData) {
         if(err) {
            logger.log('info',err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(weeklyData);
    });
};

exports.featureUseByCustomerId = function (req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));
    var customerId = parseInt(req.query['id']);
    appUsageDao.getFeatureUsageByCustomerId(customerId, startDate, endDate, function (err, data) {
         if(err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(data);
    });
};

exports.adoptionTrendByMetric = function (req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));
    var metric = req.query['metric'];
    appUsageDao.adoptionTrendByMetric(metric, startDate, endDate, function (err, data) {
         if(err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(data);
    });
};