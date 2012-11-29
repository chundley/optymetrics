var date_util = require('../util/date_util.js'),
    logger = require('../util/logger.js'),
    url = require('url'),
    fs = require('fs'),
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

exports.salesCalculator = function (req, res, next) {
    fs.readFile('./templates/sales-calculator.html', 'utf8', function (err, text) {
        if (err) {
            logger.error(err);
        }
        res.send(text);
    });
};
