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
            mongoose.connection.collections['mrrs'].drop(function (err) {
                inner_callback(null);
            });
        },
        function (inner_callback) {
            // save mrr to etlmrr collection
            async.forEach(mrrs, function (data, inner_callback2) {
                var d = new Date(data[9]);
                d.setHours(0, 0, 0, 0);                
                var mrr = new mrr_model.MRRModel({
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
        }
    ],
    function (err) { // inner callback
        if (err) {
            callback(err);
        }
        else {
            logger.info('MRR collection successfully refreshed');
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
                async.forEach(customers, function (customer, callback_inner3) {
                    getMRRTotalByCustomerMonths(customer.customerId, date, dates[dates.indexOf(date) + 1], function(err, data) {
                                    /* DEBUG BLOCK
                                    if (date.toString() == '31-Aug-12' &&customer.customerId == 50001) {
                                        logger.error('---------------------------------------------');
                                        logger.error(servicesNew + '   ' + servicesOld);
                                    }
                                    */             
                        var softwareOld = 0;
                        var softwareNew = 0;
                        var servicesOld = 0;
                        var servicesNew = 0;
                        async.forEach(data, function(row, callback_inner4) {
                            if (row.dateAdded.toString() == new Date(date).toString()) {
                                if (row.productType == 'Services') {
                                    servicesNew = row.totalPrice;
                                    callback_inner4();
                                }
                                else {
                                    softwareNew = row.totalPrice;
                                    callback_inner4();
                                }
                            }
                            else {                                
                                if (row.productType == 'Services') {
                                    servicesOld = row.totalPrice;
                                    callback_inner4();
                                }
                                else {
                                    softwareOld = row.totalPrice;
                                    callback_inner4();
                                }
                            }
                        },
                        function() { // callback_inner4
                            resolveMRRChurnSoftware(softwareNew, softwareOld, customer, date, function(err) {
                                resolveMRRChurnServices(servicesNew, servicesOld, customer, date, function(err2) {
                                    callback_inner3(err);
                                });
                            });
                        });
                    });
                },
                function(err){ // callback_inner3
                    callback_inner2(err);
                });
            },
            function(err) { // callback_inner2
                if (err) {
                    logger.error(err);
                }
                else {
                    logger.info('Churn and new MRR refresh complete');
                }
                callback(null);
            });
        });

}

/*
*  Private helper function - save churn/new for software
*/
var resolveMRRChurnSoftware = function(softwareNew, softwareOld, customer, date, callback) {
    if ( (softwareOld==0 && softwareNew==0) || (softwareOld == softwareNew) ) {
        // nothing to save
        callback(null);
    }
    else {
        if (softwareNew > softwareOld) {
            // new mrr
            var mrrNew = new mrr_model.MRRModelNew({
                customerId: customer.customerId,
                accountName: customer.accountName,
                productType: 'Software',
                totalPrice: softwareNew - softwareOld,
                dateAdded: date,
                sku: customer.sku,
                partial: softwareOld == 0 ? true : false
            });

            mrrNew.save(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    logger.info('New MRR saved: ' + mrrNew.accountName + ' ' + mrrNew.totalPrice);
                    callback(null);
                }
            });                    
        }
        else {
            // churn
            var mrrChurn = new mrr_model.MRRModelChurn({
                customerId: customer.customerId,
                accountName: customer.accountName,
                productType: 'Software',
                totalPrice: softwareOld - softwareNew,
                dateAdded: date,
                sku: customer.sku,
                partial: softwareNew == 0 ? true : false
            });

            mrrChurn.save(function (err) {
                if (err) {
                    callback(err);
                }
                else {                                          
                    logger.info('MRR churn saved: ' + mrrChurn.accountName + ' ' + mrrChurn.totalPrice);
                    callback(null);
                }
            });                    
        }
    }
}

/*
*  Private helper function - save churn/new for services
*/
var resolveMRRChurnServices = function(servicesNew, servicesOld, customer, date, callback) {
    if ( (servicesOld==0 && servicesNew==0) || (servicesOld == servicesNew) ) {
        // nothing to save
        callback(null);
    }
    else {
        if (servicesNew > servicesOld) {
            // new mrr
            var mrrNew = new mrr_model.MRRModelNew({
                customerId: customer.customerId,
                accountName: customer.accountName,
                productType: 'Services',
                totalPrice: servicesNew - servicesOld,
                dateAdded: date,
                sku: customer.sku,
                partial: servicesOld == 0 ? true : false
            });

            mrrNew.save(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    logger.info('New MRR saved: ' + mrrNew.accountName + ' ' + mrrNew.totalPrice);
                    callback(null);
                }
            });                    
        }
        else {
            // churn
            var mrrChurn = new mrr_model.MRRModelChurn({
                customerId: customer.customerId,
                accountName: customer.accountName,
                productType: 'Services',
                totalPrice: servicesOld - servicesNew,
                dateAdded: date,
                sku: customer.sku,
                partial: servicesNew == 0 ? true : false
            });

            mrrChurn.save(function (err) {
                if (err) {
                    callback(err);
                }
                else {                                          
                    logger.info('MRR churn saved: ' + mrrChurn.accountName + ' ' + mrrChurn.totalPrice);
                    callback(null);
                }
            });                    
        }
    }
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
        dates.sort(sortDate);
        callback(dates);
    });    
}

function sortDate(one, two) {
    var dateOne = stringToDate(one);
    var dateTwo = stringToDate(two);
    if (dateOne < dateTwo) {
        return 1;
    }
    else if (dateOne > dateTwo) {
        return -1;
    }
    return 0;
}

function stringToDate(stringDate) {
    var day = stringDate.split('-')[0];
    var month = stringDate.split('-')[1];
    var year = '20' + stringDate.split('-')[2];
    var numMonth = 0;
    switch(month) {
        case 'Jan': numMonth = 0; break;
        case 'Feb': numMonth = 1; break;
        case 'Mar': numMonth = 2; break;
        case 'Apr': numMonth = 3; break;
        case 'May': numMonth = 4; break;
        case 'Jun': numMonth = 5; break;
        case 'Jul': numMonth = 6; break;
        case 'Aug': numMonth = 7; break;
        case 'Sep': numMonth = 8; break;
        case 'Oct': numMonth = 9; break;
        case 'Nov': numMonth = 10; break;
        case 'Dec': numMonth = 11; break;
    }
    return new Date(year, numMonth, day-1);
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
    var map = function () {
        emit({'customerId': this.customerId, 'productType': this.productType, 'dateAdded': this.dateAdded}, 
            {
                'totalPrice': this.totalPrice
            });
    };

    var reduce = function (key, values) {
        var total = {totalPrice: 0};
        values.forEach(function(val) {
            total.totalPrice += val.totalPrice;
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

/**********************
*   public API methods
***********************/

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

/**
* Get churn aggregated by product type
* 
* VOLATILE: product types are hard-coded to support correct output after map reduce
*/
var getChurnByProductType = function (startDate, endDate, callback) {
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
        mapreduce: 'mrrchurns',
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
                                software: r.value['totalPrice'],
                                services: 0
                            });
                        } 
                        else {
                            retArr.push({
                                dateAdded: r.value['dateAdded'],
                                services: r.value['totalPrice'],
                                software:0
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
* Get new sales aggregated by product type
* 
* VOLATILE: product types are hard-coded to support correct output after map reduce
*/
var getNewSalesByProductType = function (startDate, endDate, callback) {
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
        mapreduce: 'mrrnews',
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
                                software: r.value['totalPrice'],
                                services: 0
                            });
                        } 
                        else {
                            retArr.push({
                                dateAdded: r.value['dateAdded'],
                                services: r.value['totalPrice'],
                                software:0
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
* Get mrr churn detail for a date range
*/
var getMRRChurnDetail = function(productType, startDate, endDate, callback) {
    mrr_model.MRRModelChurn
        .find({ 'productType': productType, 'dateAdded': { $gte: startDate, $lte: endDate} })
        .sort('totalPrice', -1)
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
* Get new mrr detail for a date range
*/
var getMRRNewDetail = function(productType, startDate, endDate, callback) {
    mrr_model.MRRModelNew
        .find({ 'productType': productType, 'dateAdded': { $gte: startDate, $lte: endDate} })
        .sort('totalPrice', -1)
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
* Get mrr for software/services by customer
*/
var getMRRTrendByCustomer = function(customerId, startDate, endDate, callback) {
    var command = {
        aggregate: 'mrrs',
        pipeline:
          [
            { $match: { customerId: parseInt(customerId), dateAdded: {$gte : startDate, $lte : endDate} }},  
            { $group: {_id: { dateAdded:"$dateAdded", productType: "$productType"}, mrr: { $sum: "$totalPrice" }}},
            { $project: {_id: 0, dateAdded: '$_id.dateAdded', productType: '$_id.productType', mrr: '$mrr'}},
            { $sort: {'dateAdded': 1}}
          ]
    };

    mongoose.connection.db.executeDbCommand(command, function (err, results) {
        if (err) {
            callback(err, null)
        }
        if (results.numberReturned > 0 && results.documents[0].result.length > 0) {
            // get clean formatting
            var retArr = [];
            results.documents[0].result.forEach(function(r) {
                var found = false;
                retArr.forEach(function(item) {
                    
                    if (item.dateAdded.toString() == r['dateAdded'].toString()) {
                        found = true;
                        if (r['productType'] == 'Software') {
                            item.software = r['mrr'];
                        }
                        else {
                            item.services = r['mrr'];
                        }
                    }
                });

                if (!found) {
                    if (r['productType'] == 'Software') {
                        retArr.push({
                            dateAdded: r['dateAdded'],
                            software: r['mrr'],
                            services: 0
                        });
                    } 
                    else {
                        retArr.push({
                            dateAdded: r['dateAdded'],
                            services: r['mrr'],
                            software: 0
                        });
                    }               
                }
            });
            callback(err, retArr);
        } else {
            callback(err, []);
        }
    });    
}

var getLatestMRRDate = function(callback) {
    var query = mrr_model.MRRModel.find().limit(1); // this seems to work getting the latest record, but could break
    //var query = mrr_model.MRRModel.find().sort({'dateAdded': -1}).limit(1); // doesn't seem to work for some reason
    query.execFind(function (err, doc) {
        logger.info('here');
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, doc[0].dateAdded);
        }      
    });
}

exports.saveMRRs = saveMRRs;
exports.saveMRRChurn = saveMRRChurn;

exports.getLatestMRRDate = getLatestMRRDate;
exports.getMRRTrendByCustomer = getMRRTrendByCustomer;
exports.getMRRNewDetail = getMRRNewDetail;
exports.getMRRChurnDetail = getMRRChurnDetail;
exports.getNewSalesByProductType = getNewSalesByProductType;
exports.getChurnByProductType = getChurnByProductType;
exports.getMRRByProductType = getMRRByProductType;
exports.getSoftwareMRRBySKU = getSoftwareMRRBySKU;
exports.getMRRs = getMRRs;
