var date_util = require('../util/date_util.js'),
    logger = require('../util/logger.js'),
    url = require('url'),
    fs = require('fs');
    customerDao = require('../data_access/customer-dao.js'),
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
