/**
* Access to shards collection in MongoDB
*/

/**
* node.js libraries
*/
var async = require('async'),
    mongoose = require('mongoose');

/**
* Local project includes
*/
var logger = require('../util/logger.js'),
    shard_model = require('./model/shard-model.js');

/**
* Saves shards to the shards collection
*
* NOTE: this always overwrites all shards
*/
var saveShards = function (shards, callback) {
    async.waterfall([
        function (inner_callback) {
            // drop existing ETL collection (it shouldn't exist, but try anyway)
            mongoose.connection.collections['etlshards'].drop(function (err) {
                inner_callback(null);
            });
        },
        function (inner_callback) {
            // save shards to etlshards collection
            async.forEach(shards, function (shard, inner_callback2) {
                shard.save(function (err) {
                    if (err) {
                        inner_callback2(err);
                    }
                    else {
                        logger.info('Shard saved: ' + shard.name);
                        inner_callback2(null);
                    }
                });
            },
            function (err) { // inner_callback2
                if (err) {
                    inner_callback(err);
                }
                else {
                    inner_callback(null);
                }
            });
        },
        function (inner_callback) {
            // drop existing shard collection and replace
            mongoose.connection.collections['shards'].drop(function (err) {
                mongoose.connection.collections['etlshards'].rename('shards', function (err) {
                    if (err) {
                        // this would be catastrophic - no shards collection at this point
                        inner_callback('Catastrophic failure - no shards collection: ' + err);
                    }
                    else {
                        inner_callback(null);
                    }
                });
            });
        }
    ],
    function (err) { // inner callback
        if (err) {
            callback(err);
        }
        else {
            logger.info('Shards collection successfully updated');
            callback();
        }
    });
}

exports.saveShards = saveShards;
