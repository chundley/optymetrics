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
* 
* VOLATILE: Everything here is hard-coded for 'Software' vs 'Services'
*/
var getMRRByProductType = function (startDate, endDate, callback) {
    var map = function () {
        var d = new Date(this.dateAdded);
        emit(d, 
            {
                'dateAdded': d,
                'productType': this.productType, 
                'totalPrice': this.totalPrice,
                'software': 0,
                'services': 0
            });
    };

    var reduce = function (key, values) {
        var data = {'dateAdded': null, 'productType': null, 'totalPrice': 0, 'software': 0, 'services': 0};
        values.forEach(function(val) {
            data.dateAdded = val.dateAdded;
            data.productType = val.productType;
            data.totalPrice += val.totalPrice;
            if (val.productType == 'Software') {
                data.software += val.totalPrice;
            }
            else {
                data.services += val.totalPrice;
            }
        });
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
            if (err) {
                callback(err, null)
            }
            if (results.numberReturned > 0 && results.documents[0].results.length > 0) {
                // get clean formatting
                var retArr = [];
                results.documents[0].results.forEach(function(r) {
                    retArr.push({
                        'dateAdded': r.value['dateAdded'],
                        'software': r.value['software'],
                        'services': r.value['services'],
                        'total': r.value['totalPrice']
                    });
                });
                callback(err, retArr);
            } else {
                callback(err, []);
            }
        }
    );
}

/**
* Get software MRR by SKU
* 
* VOLATILE: Everything here is hard-coded for skus
*/
var getSoftwareMRRBySKU = function (startDate, endDate, callback) {
    var map = function () {
        var d = new Date(this.dateAdded);
        emit(d, 
            {
                'dateAdded': d,
                'sku': this.sku,
                'totalPrice': this.totalPrice,
                'agency': 0,
                'express': 0,
                'pro': 0,
                'enterprise': 0
            });
    };

    var reduce = function (key, values) {
        var data = {'dateAdded': null, 'sku': null, 'totalPrice': 0, 'agency': 0, 'express': 0, 'pro': 0, 'enterprise': 0};
        values.forEach(function(val) {
            data.dateAdded = val.dateAdded;
            data.sku = val.sku;
            data.totalPrice += val.totalPrice;
            if (val.sku == 'AGENCY') {
                data.agency += val.totalPrice;
            }
            else if (val.sku=='EXPRESS') {
                data.express += val.totalPrice;
            }
            else if (val.sku=='PRO') {
                data.pro += val.totalPrice;
            }
            else if (val.sku=='ENTERPRISE') {
                data.enterprise += val.totalPrice;
            }
        });
        return data;
    };

    var where = {dateAdded: { $gte: startDate, $lte: endDate}, productType: 'Software' };
    var command = {
        mapreduce: 'mrrs',
        map: map.toString(),
        reduce: reduce.toString(), // map and reduce functions need to be strings
        query: where,
        out: { inline: 1 }
    };

    mongoose.connection.db.executeDbCommand(
        command, function (err, results) {
            if (err) {
                callback(err, null)
            }
            if (results.numberReturned > 0 && results.documents[0].results.length > 0) {
                // get clean formatting
                var retArr = [];
                results.documents[0].results.forEach(function(r) {
                    retArr.push({
                        'dateAdded': r.value['dateAdded'],
                        'agency': r.value['agency'],
                        'express': r.value['express'],
                        'pro': r.value['pro'],
                        'enterprise': r.value['enterprise'],
                        'total': r.value['totalPrice']
                    });
                });
                callback(err, retArr);
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
exports.getMRRByProductType = getMRRByProductType;
exports.getSoftwareMRRBySKU = getSoftwareMRRBySKU;
exports.getMRRs = getMRRs;
