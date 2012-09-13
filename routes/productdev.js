var storyDao = require('../data_access/story-dao.js');

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
    var startDate = new Date(parseInt(req.query['start']));
    var endDate = new Date(parseInt(req.query['end']));
    
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
    var startDate = new Date(parseInt(req.query['start']));
    var endDate = new Date(parseInt(req.query['end']));
    
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
