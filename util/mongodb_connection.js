// Encapsulation of mongodb connection

var logger = require('../util/logger'),
    mongoose = require('mongoose'),
    mongo_config = require('config').Mongo;

var connect = function () {
    var conn_str = 'mongodb://' + mongo_config.dbHost + ':' + mongo_config.dbPort + '/' + mongo_config.database;
    mongoose.connect(conn_str, function (err) {
        if (err) {
            logger.log('error', 'Error: ' + err);
        } else {
            logger.log('info', 'Connected to MongoDB: ' + conn_str);
        }
    });
};

var disconnect = function () {
    mongoose.disconnect();
};

exports.connect = connect;
exports.disconnect = disconnect;
