var async = require('async'),
    logger = require('../util/logger.js'),
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
        }
    ],
    function(err) {
        if(err) logger.log('info','Trello backfill failed: ' + err);            
    });
};

exports.trelloBackfill = trelloBackfill;
