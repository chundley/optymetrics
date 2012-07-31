var async = require('async'),
    trello = require('../data_access/trello_api.js');

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
    ]);
};

exports.trelloBackfill = trelloBackfill;
