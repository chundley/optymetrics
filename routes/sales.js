var date_util = require('../util/date_util.js'),
    url = require('url'),
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
