var async = require('async'),
    logger = require('../util/logger.js'),
    storyDao = require('../data_access/story-dao.js'),
    trello = require('../data_access/trello-api.js');

var trelloBackfill = function() {
    async.series([
        function(callback) {
            trello.backfillMembers(function(err) {
                (err) ? callback(err) : callback();
            });
        },
        function(callback) {
            trello.backfillLists(function(err) {
                (err) ? callback(err) : callback();
            });
        },
        function(callback) {
            trello.backfillStories(function(err) {
                (err) ? callback(err) : callback();
            });
        },
        function(callback) {
            logger.log('info', 'Calculating story cycle time');
            storyDao.calculateCycleTime(function(err) {
                logger.log('info', 'Calculating done calculating cycle time');
                (err) ? callback(err) : callback();
            });
        }
    ],
    function(err) {
        if(err) logger.log('info','Trello backfill failed: ' + err);            
    });
};

exports.trelloBackfill = trelloBackfill;
