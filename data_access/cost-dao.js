/**
* Access to the costs collection in MongoDB. There's also a helper method here
* to do the import from csv that could (should) be in a separate api class. It
* will likely be a CRUD interface someday and will live in this set of functions
* anyway.
*/

var csv = require('csv');

var async = require('async'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    logger = require('../util/logger.js'),
    cost_model = require('./model/cost-model.js');

/**
* Backfills cost data from ./data_access/data_feed/costs-data.csv
*
* NOTE: Always drops and re-creates the collection
*/
var costBackfill = function (callback) {
    var costs = [];
    var now = new Date();
    csv().fromPath('./data_access/data_feed/costs-data.csv').on("data", function (data, index) {
        // Make sure the first line isn't a header
        if (!isNaN(data[3])) {
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
        }

    }).on('end', function (count) {
        mongoose.connection.collections['costs'].drop(function (err) {
            if (err) {
                logger.error('Could not drop costs collection: ' + err);
            }
        });

        async.forEach(costs, function (cost, callback_inner) {
            cost.save(function (err) {
                if (err) {
                    callback_inner(err);
                }
                else {
                    callback_inner();
                }
            });

        },
        function (err) { // callback_inner
            if (err) {
                callback(err);
            }
            else {
                callback();
            }
        });
    }).on('error', function (err) {
        callback(err);
    });
};

var getCostSummary = function (callback) {
    var costs = {
        tcoKeywords: 0,
        tcoTraffic: 0,
        tcoEmail: 0,
        tcoOverhead: 0
    };
    cost_model.CostModel.find({}, function (err, docs) {
        async.forEach(docs, function (doc, callback_inner) {
            costs.tcoKeywords += doc.monthlyCost * doc.percSEO;
            costs.tcoTraffic += doc.monthlyCost * doc.percTraffic;
            costs.tcoEmail += doc.monthlyCost * doc.percEmail;
            costs.tcoOverhead += doc.monthlyCost * doc.percOverhead;
            callback_inner();
        },
        function (err) { // callback_inner
            if (err) {
                callback(err, null);
            }
            callback(null, costs);
        });
    });
};

exports.costBackfill = costBackfill;
exports.getCostSummary = getCostSummary;
