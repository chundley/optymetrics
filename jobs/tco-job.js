/**
* Job for refreshing TCO data
*/

/**
* node.js libraries
*/
var async = require('async');

/**
* Local project libraries
*/
var logger = require('../util/logger.js'),
    shard = require('../data_access/shard-dao.js'),
    coredb = require('../data_access/coredb-api.js');

var tcoJob = function () {
    async.series([
        function (callback) {
            coredb.getShards(function (err, shards) {
                if (err) {
                    callback(err);
                }
                else {
                    shard.saveShards(shards, function (err) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            callback(null);
                        }
                    });
                }
            });
        }
    ],
    function (err) {
        if (err) {
            logger.error(err);
        }
        else {
            logger.info('TCO data refresh complete');
        }
    });
}

exports.tcoJob = tcoJob;
