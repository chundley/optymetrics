/**
* Access to mrr collection in MongoDB
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
    mrr_model = require('./model/mrr-model.js');

/**
* Saves mrr data to the mrr collection
*
* NOTE: this always overwrites all data
*/
var saveMRRs = function (mrrs, callback) {
    async.waterfall([
        function (inner_callback) {
            // drop existing ETL collection (it shouldn't exist, but try anyway)
            mongoose.connection.collections['etlmrrs'].drop(function (err) {
                inner_callback(null);
            });
        },
        function (inner_callback) {
            // save mrr to etlmrr collection
            async.forEach(mrrs, function (data, inner_callback2) {
                var mrr = new mrr_model.MRRModelETL({
                    customerId: data[0],
                    accountName: data[1],
                    productType: data[2],
                    customerType: data[3],
                    opportunityName: data[4],
                    opportunityOwner: data[5],
                    productName: data[6],
                    totalPrice: data[7],
                    dateAdded: data[9],
                    sku: data[10]
                });

                mrr.save(function (err) {
                    if (err) {
                        inner_callback2(err);
                    }
                    else {
                        logger.info('MRR saved: ' + mrr.accountName + ' ' + mrr.productName);
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
            // drop existing mrr collection and replace
            mongoose.connection.collections['mrrs'].drop(function (err) {
                mongoose.connection.collections['etlmrrs'].rename('mrrs', function (err) {
                    if (err) {
                        // this would be catastrophic - no mrr collection at this point
                        inner_callback('Catastrophic failure - no mrr collection: ' + err);
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
            logger.info('MRR collection successfully updated');
            callback();
        }
    });
}

/**
* Get MRRs aggregated by product type
*/
var getMRRsByProductType = function (startDate, endDate, callback) {
    var map = function () {
        emit('mrrs', 
            {
              'productType': this.productType, 
              'totalPrice': this.totalPrice, 
              'dateAdded': this.dateAdded
            });
    };

    var reduce = function (key, values) {
        var data = {};
        data.arr = [];
        for (var i in values) {
            if (i.productType == 'Software') {
                data.arr[values[i].dateAdded].software += i.totalPrice;
            }
            else if (i.productType == 'Services') {
                data.arr[values[i].dateAdded].services += i.totalPrice;                
            }

        }
        return data;
    };

    var where = {dateAdded: { $gte: startDate, $lte: endDate} };

    var command = {
        mapreduce: 'mrrs',
        map: map.toString(),
        reduce: reduce.toString(), // map and reduce functions need to be strings
        query: where,
        out: { inline: 1 }
    };
    mongoose.connection.db.executeDbCommand(
        command, function (err, results) {
            logger.info(results);
            if (err) {
                callback(err, null)
            }
            if (results.numberReturned > 0 && results.documents[0].results.length > 0) {
                // BUGBUG: this can result in bad things when no data is returned from mapreduce (but results is always returned)
                callback(err, results.documents[0].results[0].value);
            } else {
                callback(err, []);
            }
        }
    );
}

/**
* Gets all mrrs for the specified date range
*/
var getMRRs = function (startDate, endDate, callback) {
    mrr_model.MRRModel
        .find({ 'dateAdded': { $gte: startDate, $lte: endDate} })
        .sort('dateAdded', 1)
        .exec(function (err, mrrs) {
            if (err) {
                callback(err, null);
            }
            else {
                callback(null, mrrs);
            }
        });
};

exports.saveMRRs = saveMRRs;
exports.getMRRsByProductType = getMRRsByProductType;
exports.getMRRs = getMRRs;