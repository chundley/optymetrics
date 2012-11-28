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
                var d = new Date(data[9]);
                d.setHours(0, 0, 0, 0);                
                var mrr = new mrr_model.MRRModelETL({
                    customerId: data[0],
                    accountName: data[1],
                    productType: data[2],
                    customerType: data[3],
                    opportunityName: data[4],
                    opportunityOwner: data[5],
                    productName: data[6],
                    totalPrice: data[7],
                    dateAdded: d,
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

var saveMRRChurn = function(mrrs, callback) {
    var products = [];
    var dates = [];
    var customers = [];

    async.series([
            function(callback_inner) {
                mongoose.connection.collections['mrrchurns'].drop(function (err) {
                    if (err) {
                        // this will only happen if the collection doesn't already exist
                        logger.warn(err);
                    }
                    callback_inner();
                });       
            },
            function(callback_inner) {
                mongoose.connection.collections['mrrnews'].drop(function (err) {
                    if (err) {
                        // this will only happen if the collection doesn't already exist
                        logger.warn(err);
                    }
                    callback_inner();
                });       
            },
            function(callback_inner) {
                getUniqueDates(mrrs, function (vals) {
                    dates = vals;
                    callback_inner();
                });
            },
            function(callback_inner) {
                getUniqueCustomers(mrrs, function (vals){
                    customers = vals;
                    callback_inner();
                });
            }
        ],
        function() { // callback_inner
            async.forEach(dates, function (date, callback_inner2) {
                logger.info(dates[dates.indexOf(date) + 1]);
                async.forEach(customers, function(customer, callback_inner3) {
                    getMRRTotalByCustomerMonths(customer.customerId, date, dates[dates.indexOf(date) + 1], function(err, data) {
                        if (customer.customerId == 3135) {
                            logger.info(date);
                            logger.info(dates[dates.indexOf(date) + 1]);
                            logger.info(data);
                        
                        var dateExists = function(data, date) {
                            var exists = false;
                            var d = new Date(date);
                            for (var i=0; i<data.length; i++) {
                                //logger.info('DA: ' + data[i].dateAdded + '    ' + d);
                                if (data[i].dateAdded.toString() == d.toString()) {
                                    exists = true;
                                }
                            }
                            return exists;
                        }
                        var softwareOld = 0;
                        var softwareNew = 0;
                        var servicesOld = 0;
                        var servicesNew = 0;
                        async.forEach(data, function(row, callback_inner4) {
                            if (row.dateAdded.toString() == new Date(date).toString()) {
                                if (row.productType == 'Services') {
                                    servicesNew = row.totalPrice;
                                }
                                else {
                                    softwareNew = row.totalPrice;
                                }
                            }
                            else {
                                if (row.productType == 'Services') {
                                    servicesOld = row.totalPrice;
                                }
                                else {
                                    softwareOld = row.totalPrice;
                                }
                            }
                            callback_inner4();
                        },
                        function() { // callback_inner4
                            // when we get here, there are several different combinations of data (for both software and services):
                            //   1. All values are zero - neither date had MRR for this customer
                            //   2. a. softwareNew > 0, softwareOld == 0 [new MRR, new software customer]
                            //      b. softwareNew > 0, 0 < softwareOld < softwareNew [new MRR to existing customer (add-on)]
                            //   3. a. softwareOld > 0, softwareNew == 0 [churn (100% software loss)]
                            //      b. softwareOld > 0, 0 < softwareNew < softwareOld [MRR churn but the account is still active

                            // new software mrr
                            if (softwareNew > 0 && softwareOld == 0) {
                                var mrrNew = new mrr_model.MRRModelNew({
                                    customerId: customer.customerId,
                                    accountName: customer.accountName,
                                    productType: 'Software',
                                    totalPrice: softwareNew,
                                    dateAdded: date,
                                    sku: customer.sku,
                                    partial: false
                                });

                                mrrNew.save(function (err) {
                                    if (err) {
                                        //inner_callback2(err);
                                    }
                                    else {
                                        logger.info('New MRR saved: ' + mrrNew.accountName + ' ' + mrrNew.productType);
                                        //inner_callback2(null);
                                    }
                                });
                            }

                            // MRR changed but full account wasn't lost
                            if (softwareNew > 0 && softwareOld > 0 && softwareNew != softwareOld) {
                                // new MRR added to existing account
                                if (softwareNew > softwareOld) {
                                    var mrrNew = new mrr_model.MRRModelNew({
                                        customerId: customer.customerId,
                                        accountName: customer.accountName,
                                        productType: 'Software',
                                        totalPrice: softwareNew - softwareOld,
                                        dateAdded: date,
                                        sku: customer.sku,
                                        partial: true
                                    });

                                    mrrNew.save(function (err) {
                                        if (err) {
                                            //inner_callback2(err);
                                        }
                                        else {
                                            logger.info('New MRR saved: ' + mrrNew.accountName + ' ' + mrrNew.productType);
                                            //inner_callback2(null);
                                        }
                                    });                                    
                                }
                                // MRR churn but not full account loss
                                else {
                                    var mrrChurn = new mrr_model.MRRModelChurn({
                                        customerId: customer.customerId,
                                        accountName: customer.accountName,
                                        productType: 'Software',
                                        totalPrice: softwareOld - softwareNew,
                                        dateAdded: date,
                                        sku: customer.sku,
                                        partial: true
                                    });

                                    mrrChurn.save(function (err) {
                                        if (err) {
                                            //inner_callback2(err);
                                        }
                                        else {
                                            logger.info('MRR churn saved: ' + mrrChurn.accountName + ' ' + mrrChurn.productType);
                                            //inner_callback2(null);
                                        }
                                    });
                                }
                            }

                            // new services mrr
                            if (servicesNew > 0 && servicesOld == 0) {
                                var mrrNew = new mrr_model.MRRModelNew({
                                    customerId: customer.customerId,
                                    accountName: customer.accountName,
                                    productType: 'Services',
                                    totalPrice: servicesNew,
                                    dateAdded: date,
                                    sku: customer.sku,
                                    partial: false
                                });

                                mrrNew.save(function (err) {
                                    if (err) {
                                        //inner_callback2(err);
                                    }
                                    else {
                                        logger.info('New MRR saved: ' + mrrNew.accountName + ' ' + mrrNew.productType);
                                        //inner_callback2(null);
                                    }
                                });
                            }

                            // software 100% churn
                            if (softwareOld > 0 && softwareNew == 0) {
                                var mrrChurn = new mrr_model.MRRModelChurn({
                                    customerId: customer.customerId,
                                    accountName: customer.accountName,
                                    productType: 'Software',
                                    totalPrice: softwareOld,
                                    dateAdded: date,
                                    sku: customer.sku,
                                    partial: false
                                });

                                mrrChurn.save(function (err) {
                                    if (err) {
                                        //inner_callback2(err);
                                    }
                                    else {
                                        logger.info('MRR churn saved: ' + mrrChurn.accountName + ' ' + mrrChurn.productType);
                                        //inner_callback2(null);
                                    }
                                });
                            }

                            // services 100% churn
                            if (servicesOld > 0 && servicesNew == 0) {
                                var mrrChurn = new mrr_model.MRRModelChurn({
                                    customerId: customer.customerId,
                                    accountName: customer.accountName,
                                    productType: 'Services',
                                    totalPrice: servicesOld,
                                    dateAdded: date,
                                    sku: customer.sku,
                                    partial: false
                                });

                                mrrChurn.save(function (err) {
                                    if (err) {
                                        //inner_callback2(err);
                                    }
                                    else {
                                        logger.info('MRR churn saved: ' + mrrChurn.accountName + ' ' + mrrChurn.productType);
                                        //inner_callback2(null);
                                    }
                                });
                            }

                            logger.error('Services NEW: ' + servicesNew);
                            logger.error('Services OLD: ' + servicesOld);
                            logger.error('Software NEW: ' + softwareNew);
                            logger.error('Software OLD: ' + softwareOld);
                                                    
                        });
                    }
                        callback_inner3();
                    });
                },
                function(){ // callback_inner3
                    callback_inner2();
                });
            },
            function() { // callback_inner2
                logger.info('Dates DONE');
                callback(null);
            });
        });

}
/**
* Get MRRs aggregated by product type
* 
* VOLATILE: product types are hard-coded to support correct output after map reduce
*/
var getMRRByProductType = function (startDate, endDate, callback) {
    var map = function () {
        var d = new Date(this.dateAdded);
        emit({dateAdded: d, productType: this.productType}, 
            {
                'dateAdded': d,
                'productType': this.productType, 
                'totalPrice': this.totalPrice
            });
    };

    var reduce = function (key, values) {
        var data = {'dateAdded': null, 'productType': null, totalPrice: 0};
        values.forEach(function(val) {
            data.dateAdded = val.dateAdded;
            data.productType = val.productType;
            data.totalPrice += val.totalPrice;
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
                    var found = false;
                    retArr.forEach(function(item) {
                        if (item.dateAdded.toString() == r.value['dateAdded'].toString()) {
                            found = true;
                            if (r.value['productType'] == 'Software') {
                                item.software = r.value['totalPrice'];
                            }
                            else {
                                item.services = r.value['totalPrice'];
                            }
                        }
                    });

                    if (!found) {
                        if (r.value['productType'] == 'Software') {
                            retArr.push({
                                dateAdded: r.value['dateAdded'],
                                software: r.value['totalPrice']
                            });
                        } 
                        else {
                            retArr.push({
                                dateAdded: r.value['dateAdded'],
                                services: r.value['totalPrice']
                            });
                        }               
                    }
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
* VOLATILE: SKU's hard-coded to re-format map reduce results into readable data set
*/
var getSoftwareMRRBySKU = function (startDate, endDate, callback) {
    var map = function () {
        var d = new Date(this.dateAdded);
        emit({dateAdded: d, sku: this.sku}, 
            {
                'dateAdded': d,
                'sku': this.sku, 
                'totalPrice': this.totalPrice
            });
    };

    var reduce = function (key, values) {
        var data = {'dateAdded': null, 'sku': null, 'totalPrice': 0};
        values.forEach(function(val) {
            data.dateAdded = val.dateAdded;
            data.sku = val.sku;
            data.totalPrice += val.totalPrice;
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
                    var found = false;
                    retArr.forEach(function(item) {
                        if (item.dateAdded.toString() == r.value['dateAdded'].toString()) {
                            found = true;
                            if (r.value['sku'] == 'EXPRESS') {
                                item.express = r.value['totalPrice'];
                            }
                            else if (r.value['sku'] == 'PRO') {
                                item.pro = r.value['totalPrice'];
                            }
                            else if (r.value['sku'] == 'ENTERPRISE') {
                                item.enterprise = r.value['totalPrice'];
                            }
                            else if (r.value['sku'] == 'AGENCY') {
                                item.agency = r.value['totalPrice'];
                            }
                        }
                    });

                    if (!found) {
                        if (r.value['sku'] == 'EXPRESS') {
                            retArr.push({
                                dateAdded: r.value['dateAdded'],
                                express: r.value['totalPrice']
                            });
                        } 
                        else if (r.value['sku'] == 'PRO') {
                            retArr.push({
                                dateAdded: r.value['dateAdded'],
                                pro: r.value['totalPrice']
                            });
                        }
                        else if (r.value['sku'] == 'ENTERPRISE') {
                            retArr.push({
                                dateAdded: r.value['dateAdded'],
                                enterprise: r.value['totalPrice']
                            });
                        }
                        else if (r.value['sku'] == 'AGENCY') {
                            retArr.push({
                                dateAdded: r.value['dateAdded'],
                                agency: r.value['totalPrice']
                            });
                        }  
                    }
                });
                callback(err, retArr);
            } else {
                callback(err, []);
            }
        }
    );
}

/*
*  Private helper function - get unique dates from a set of mrrs
*/
var getUniqueDates = function(mrrs, callback) {
    var dates = [];
    async.forEach(mrrs, function (data, inner_callback) {      
        var dfound = function(dates) {
            for (var i=0; i<dates.length; i++) {
                if (dates[i] == data[9]) {
                    return true;
                }
            }
            return false;
        }

        if (!dfound(dates)) {
                dates.push(data[9]);
        }
        inner_callback();
    },
    function() { // inner_callback
        callback(dates);
    });    
}

/*
*  Private helper function - get unique customers from a set of mrrs
*/
var getUniqueCustomers = function(mrrs, callback) {
    var customers = [];
    async.forEach(mrrs, function (data, inner_callback) {         
        var cfound = function(customers) {
            for (var i=0; i<customers.length; i++) {
                if (customers[i].customerId == data[0]) {
                    return true;
                }
            }
            return false;
        }

        if (!cfound(customers)) {
                customers.push({
                    customerId: data[0],
                    accountName: data[1],
                    sku: data[10]
                });
        }
        inner_callback();
    },
    function() { // inner_callback
        callback(customers);
    });    
}

var getMRRTotalByCustomerMonths = function(customerId, monthCurrent, monthPrevious, callback) {
    logger.info(customerId + '  ' + monthCurrent + '  ' + monthPrevious);
    var map = function () {
        emit({'customerId': this.customerId, 'productType': this.productType, 'dateAdded': this.dateAdded}, 
            {
                'totalPrice': this.totalPrice
            });
    };

    var reduce = function (key, values) {
        var total = 0;
        values.forEach(function(val) {
            total += val.totalPrice;
        });
        return total;
    };

    var d1 = new Date(monthCurrent);
    var d2 = new Date(monthPrevious);
    var where = {customerId: parseInt(customerId), dateAdded: { $gte: d2, $lte: d1} };
    var command = {
        mapreduce: 'mrrs',
        map: map.toString(),
        reduce: reduce.toString(), // map and reduce functions need to be strings
        query: where,
        out: { inline: 1 }
    };

    mongoose.connection.db.executeDbCommand(command, function (err, results) {
        if (err) {
            callback(err, null)
        }
        if (results.numberReturned > 0 && results.documents[0].results.length > 0) {
            // clean up the results before returning
            var ret = [];
            async.forEach(results.documents[0].results, function(result, callback_inner) {
                ret.push({
                    dateAdded: result._id.dateAdded,
                    productType: result._id.productType,
                    totalPrice: result.value.totalPrice
                });
                callback_inner();
            },
            function() {// callback_inner
                callback(null, ret);
            });
        } else {
            callback(err, 0);
        }
    });
}

/*
* Private helper function - get software and services mrr for a specific customer in a specific month
*/
var getMRRTotalByCustomerMonth = function(customerId, month, callback) {
    var map = function () {
        emit({'customerId': this.customerId, 'productType': this.productType}, 
            {
                'totalPrice': this.totalPrice
            });
    };

    var reduce = function (key, values) {
        var total = 0;
        values.forEach(function(val) {
            total += val.totalPrice;
        });
        return total;
    };

    var d = new Date(month);
    var where = {customerId: parseInt(customerId), dateAdded: d};
    var command = {
        mapreduce: 'mrrs',
        map: map.toString(),
        reduce: reduce.toString(), // map and reduce functions need to be strings
        query: where,
        out: { inline: 1 }
    };

    mongoose.connection.db.executeDbCommand(command, function (err, results) {
        if (err) {
            callback(err, null)
        }
        if (results.numberReturned > 0 && results.documents[0].results.length > 0) {
            var ret = [];
            async.forEach(results.documents[0].results, function(result, callback_inner) {
                ret.push({
                    productType: result._id.productType,
                    totalPrice: result.value.totalPrice
                });
                callback_inner();
            },
            function() {// callback_inner
                callback(null, ret);
            });
        } else {
            callback(err, 0);
        }
    });
}

var getMRRsByCustomerId = function(startDate, endDate, customerId, callback) {
    mrr_model.MRRModel
        .find({'customerId': customerId, 'dateAdded': { $gte: startDate, $lte: endDate} })
        .sort('dateAdded', 1)
        .exec(function (err, mrrs) {
            if (err) {
                callback(err, null);
            }
            else {
                callback(null, mrrs);
            }
        });
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
exports.saveMRRChurn = saveMRRChurn;

exports.getMRRByProductType = getMRRByProductType;
exports.getSoftwareMRRBySKU = getSoftwareMRRBySKU;
exports.getMRRs = getMRRs;
