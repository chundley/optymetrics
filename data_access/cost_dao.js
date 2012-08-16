/**
* Access to cost data and backfill implementation.  Right now it's a simple .csv
* import.  In the future could be extended to a web interface
*/

var csv = require('csv');

var async = require('async'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    logger = require('../util/logger.js'),
    cost_model = require('./model/cost_model.js');

/**
* Helper function to support async.forEach to save costs with proper
* callback syntax to notify when all saves are complete
*
* BUG: The first line of the .csv fails because it's the header
*/
var saveCost = function (cost, callback) {
    cost.save(function (err) {
        if (err) {
            logger.log('error', "Error: " + err);
        }
        else {
            logger.log('info', 'Cost saved: ' + cost.detail);
        }
        callback();
    });
}

var costBackfill = function (fileName, callback) {
    var costs = [];
    var now = new Date();
    csv().fromPath(fileName).on("data", function (data, index) {
        var costmodel = new cost_model.CostModel({
            importDT: now,
            vendor: data[0],
            type: data[1],
            detail: data[2],
            monthlyCost: data[3],
            percSEO: data[4],
            percTraffic: data[5],
            percEmail: data[6],
            percOverhead: data[7],
            notes: data[8]
        });
        costs.push(costmodel);

    }).on('end', function (count) {
        mongoose.connection.collections['costs'].drop(function (err) {
            if (err) {
                logger.log('error', 'Could not drop costs collection: ' + err);
            }
        });

        async.forEach(costs, saveCost, function (err) {
            logger.log('info', 'Finished importing COGS: ' + count + ' items imported');
            callback();
        });
    }).on('error', function (err) {
        logger.log('error', 'Error: ' + err);
    });
};

exports.costBackfill = costBackfill;
