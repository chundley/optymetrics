var date_util = require('../util/date_util.js'),
    logger = require('../util/logger.js'),
    url = require('url'),
    fs = require('fs'),
    csv = require('csv'),
    _ = require('underscore'),      
    appUsageDao = require('../data_access/appusage-dao.js'),
    mrr_dao = require('../data_access/mrr-dao.js');

exports.monthlyCustomersBySku = function (req, res, next) {
    appUsageDao.getMonthlyCustomersBySku(function (err, monthlyData) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(monthlyData);
    });
};

exports.mrrs = function (req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));

    mrr_dao.getMRRs(startDate, endDate, function (err, results) {
        if (err) {
            logger.log('info', err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
};

exports.mrrsByProductType = function (req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));

    mrr_dao.getMRRByProductType(startDate, endDate, function (err, results) {
        if (err) {
            logger.log('info', err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
};

exports.mrrsByProductTypeCSV = function (req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));

    mrr_dao.getMRRByProductType(startDate, endDate, function (err, rows) {
        if (err) {
            logger.log('info', err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        var source = [ ['Date', 'Software MRR', 'Services MRR' ] ];
        _.each(rows, function(row) {
            var r = [];
            r.push((row.dateAdded.getMonth() + 1).toString() + '-' + row.dateAdded.getFullYear());
            r.push(row.software);
            r.push(row.services);
            source.push(r);
        });
        var result = [];
        csv().from(source)
            .on('data', function(data) {
                result.push(data.join(','));
            })
            .on('end', function() {
                res.setHeader('Content-disposition', 'attachment; filename=mrr-by-product-type.csv');
                res.setHeader('Content-type', 'application/octet-stream;charset=UTF-8');
                res.send(result.join('\n'));
            });
    });
};

exports.mrrsSoftwareBySKU = function (req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));

    mrr_dao.getSoftwareMRRBySKU(startDate, endDate, function (err, results) {
        if (err) {
            logger.log('info', err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
};

exports.mrrsChurnByProductType = function (req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));

    mrr_dao.getChurnByProductType(startDate, endDate, function (err, results) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
};

exports.mrrsNewSalesByProductType = function (req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));

    mrr_dao.getNewSalesByProductType(startDate, endDate, function (err, results) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
};

exports.mrrsChurnDetail = function (req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));
    var productType = req.query['type'];
    mrr_dao.getMRRChurnDetail(productType, startDate, endDate, function (err, results) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
};

exports.mrrsNewDetail = function (req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));
    var productType = req.query['type'];
    mrr_dao.getMRRNewDetail(productType, startDate, endDate, function (err, results) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
};

exports.mrrTrendByCustomer = function (req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));
    var customerId = req.query['id'];
    mrr_dao.getMRRTrendByCustomer(customerId, startDate, endDate, function (err, results) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
};

exports.salesCalculator = function (req, res, next) {
    fs.readFile('./templates/sales-calculator.html', 'utf8', function (err, text) {
        if (err) {
            logger.error(err);
        }
        res.send(text);
    });
};
