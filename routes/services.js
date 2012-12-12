var date_util = require('../util/date_util.js'),
    logger = require('../util/logger.js'),
    url = require('url'),
    fs = require('fs');
    //appUsageDao = require('../data_access/appusage-dao.js'),
    //mrr_dao = require('../data_access/mrr-dao.js');

exports.dummy = function (req, res, next) {
    /*
    appUsageDao.getMonthlyCustomersBySku(function (err, monthlyData) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }*/
        res.send('nothing');
    //});
};
