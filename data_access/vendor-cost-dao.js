/**
* Access to the vendor cost collection in MongoDB
*/

var csv = require('csv');

var async = require('async'),
    mongoose = require('mongoose'),
    logger = require('../util/logger.js'),
    vendorCostModel = require('./model/vendor-cost-model.js');

/**
* Backfills vendor cost from an array of objects passed in (see vendor-cost-api.js
* for details)
*/
var vendorCostBackfill = function (data, callback) {
    mongoose.connection.collections['vendorcosts'].drop(function (err) {
        if (err) {
            // this will only happen if the collection doesn't already exist
            logger.warn(err);
        }
        async.forEach(data, function(row, callback_inner) {
            var vcm = new vendorCostModel.VendorCostModel({
                billngMonth: row.billingMonth,
                vendorName: row.vendorName,
                amount: row.amount,
                percSEO: row.percSEO,
                percLeads: row.percLeads,
                percEmail: row.percEmail,
                percOverhead: row.percOverhead,
                notes: row.notes,
                amountSEO: row.amountSEO,
                amountLeads: row.amountLeads,
                amountEmail: row.amountEmail,
                amountOverhead: row.amountOverhead
            });

            vcm.save(function (err) {
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
    });
};

exports.vendorCostBackfill = vendorCostBackfill;
