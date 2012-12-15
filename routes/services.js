var date_util = require('../util/date_util.js'),
    logger = require('../util/logger.js'),
    url = require('url'),
    fs = require('fs'),
    customerDao = require('../data_access/customer-dao.js'),
    appUsageDao = require('../data_access/appusage-dao.js');
    //mrr_dao = require('../data_access/mrr-dao.js');

exports.findCustomer = function (req, res, next) {
    var query = req.query['q'];
    customerDao.findCustomers(query, function (err, customers) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(customers);
    });
};

exports.getCustomerById = function (req, res, next) {
    var customerId = req.params.id;
    if(!customerId) {
        res.statusCode = 401;
        res.send('Bad request');
        return;
    }
    
    customerDao.getCustomerById(customerId, function (err, customer) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(customer);
    });
};

exports.bigScoreByCustomerId = function (req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));
    var customerId = req.query['id'];
    appUsageDao.getBigScoreByCustomerId(customerId, startDate, endDate, function (err, results) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
};
