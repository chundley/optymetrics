var date_util = require('../util/date_util.js'),
    logger = require('../util/logger.js'),
    url = require('url'),
    fs = require('fs'),
    appUsageDao = require('../data_access/appusage-dao.js');

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

exports.salesCalculator = function (req, res, next) {
    fs.readFile(__dirname + '../../templates/sales-calculator.html', 'utf8', function (err, text) {
        if (err) {
            logger.error(err);
        }
        res.send(text);
    });
};
