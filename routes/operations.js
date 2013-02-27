var date_util = require('../util/date_util.js'),
    incidentsDao = require('../data_access/incidents-dao.js'),
    logger = require('../util/logger.js'),
    moment = require('moment'),
    pingdom_api = require('../data_access/pingdom-api.js'),
    tco_dao = require('../data_access/tco-dao.js'),
    uptime = require('../data_access/uptime-dao.js'),
    url = require('url'),
    csv = require('csv'),
    _ = require('underscore'),    
    vendorCostDao = require('../data_access/vendor-cost-dao.js');

exports.tco = function (req, res, next) {
    var params = url.parse(req.url, true).query;
    var count = 50;
    if (params.count) {
        count = params.count;
    }
    tco_dao.getCustomerTCOData(count, function (err, customers) {
        if (err) {
            logger.log('error', err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(customers);
    });
};

exports.tcoCSV = function (req, res, next) {
    tco_dao.getCustomerTCOData(100000, function (err, customers) {
        if (err) {
            logger.log('error', err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        var source = [ ['CustomerId', 'Customer', 'Sku', 'TBS', 'Created', 'Sites', 'Page Views (30d)', 'Visitors (30d)', 'Traffic TCO', 'Keywords', 'Keyword TCO', 'Total TCO', 'Software MRR', 'Services MRR', 'Net Revenue' ] ];
        _.each(customers, function(customer) {
            var row = [];
            row.push(customer.id);
            row.push('"' + customer.name + '"');
            row.push('"' + customer.sku + '"');
            row.push(customer.bigScore);
            row.push((customer.createdAt.getMonth() + 1).toString() + '-' + customer.createdAt.getDate() + '-' + customer.createdAt.getFullYear());
            row.push(customer.sites);
            row.push(customer.pageviews);
            row.push(customer.visitors);
            row.push(customer.tcoTraffic);
            row.push(customer.keywords);
            row.push(customer.tcoSEO);
            row.push(customer.tcoTotal);
            row.push(customer.mrr);
            row.push(customer.mrrServices);
            row.push(customer.netRevenue);
            source.push(row);
        });
        var result = [];
        //res.ContentType('csv');
        csv().from(source)
            .on('data', function(data) {
                result.push(data.join(','));
            })
            .on('end', function() {
                res.setHeader('Content-disposition', 'attachment; filename=tco.csv');
                res.setHeader('Content-type', 'application/octet-stream;charset=UTF-8');
                res.send(result.join('\n'));
            });
    });
};

exports.monitors = function (req, res, next) {
    pingdom_api.getAllMonitors(function (err, monitors) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(monitors);
    });
};

exports.incidents = function(req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));

    incidentsDao.getIncidents(startDate, endDate, function(err, results) {
         if(err) {
            logger.log('info',err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
};

exports.incidentsByDay = function(req, res, next) {
    var startDate = date_util.convertDateToUTC(new Date(parseInt(req.query['start'])));
    var endDate = date_util.convertDateToUTC(new Date(parseInt(req.query['end'])));

    incidentsDao.getIncidentAggregate(startDate, endDate, function(err, results) {
         if(err) {
            logger.log('info',err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
};

exports.incident = function(req, res, next) {
    res.render('incident', { title: 'Add Incident', mode: 'add', scripts: [], message: null, model: {} });
};

exports.getIncident = function(req, res, next) {
    var incidentNumber = req.params.id;    
    if(!incidentNumber) {
        res.statusCode = 401;
        res.send('Bad request');
        return;
    }

    incidentsDao.getIncidentByIncidentNumber(incidentNumber, function(err, incident) {
        if(err) {
            logger.log('error', err);
            res.statusCode = 500;
            res.send('Unable to find incident with number ' + num);
            return;
        }

        res.render('incident', { title: 'Edit Incident', mode: 'edit', scripts: [], message: null, model: incident });
    });
};

exports.hideIncident = function(req, res, next) {
    var incidentNumber = req.params.id;
    if(!incidentNumber) {
        res.statusCode = 401;
        res.send('Bad request');
        return;
    }
   
    incidentsDao.getIncidentByIncidentNumber(incidentNumber, function(err, incident) {
        if(err) {
            logger.log('error', err);
            res.statusCode = 500;
            res.send('Unable to find incident with number ' + num);
            return;
        }

        incident.hidden = true;
        incident.save(function(err) {
            if(err) {
                logger.log('error', err);
            }
            res.redirect('/#operations/incidents'); 
        });
    });

};

exports.createIncident = function(req, res, next) {
    var model = req.body;
    
    if(model.detail == '' || model.notes == '' || !model.incidentdate) {
        res.render('incident', { 'title': 'Add Incident', mode: 'add', scripts: [], message: { level: 'error', content: 'Required fields missing' }, model: model}); 
        return;
    }

    incidentsDao.insertIncident(new Date().getTime(), moment(model.incidentdate).toDate(), new Date(), req.session.user.displayName, 
                                model.detail, model.status, false, model.notes, model.source, function(err) {
        if(err) {
            logger.log('error', err);
            res.render('incident', { 'title': 'Add Incident', mode: 'add', scripts: [], message: { level: 'error', content: 'Unable to add incident' }, model: model }); 
            return;
        } else {
            res.render('incident', { title: 'Add Incident', mode: 'add', scripts: [], 
                       message: { level: 'success', content: 'Incident added: <a href="/#operations/incidents">Back to Incidents Report</a>' }, model: {} });
            return;
        }
    });
};

exports.updateIncident = function(req, res, next) {
    var incidentNumber = req.params.id;
    var model = req.body;
    
    if(model.detail == '' || model.notes == '' || !model.incidentdate) {
        res.render('incident', { 'title': 'Edit Incident', mode: 'edit', scripts: [], message: { level: 'error', content: 'Required fields missing' }, model: model}); 
        return;
    }

    incidentsDao.getIncidentByIncidentNumber(incidentNumber, function(err, incident) {
        if(err) {
            logger.log('error', err);
            res.statusCode = 500;
            res.send('Unable to find incident with number ' + num);
            return;
        }

        incident.subject = model.detail;
        incident.createdOn = moment(model.incidentdate).toDate();
        incident.status = model.status;
        incident.source = model.source;
        incident.notes = model.notes;
        incident.lastUpdatedOn = new Date();
        incident.lastUpdatedBy = req.session.user.displayName;

        incident.save(function(err) {
            if(err) {
                logger.log('error', err);
            }
            res.redirect('/#operations/incidents'); 
        });
    });
}


exports.uptime = function (req, res, next) {
    var startDate = new Date(parseInt(req.query['start']));
    var endDate = new Date(parseInt(req.query['end']));
    uptime.getUptimeData(null, startDate, endDate, function (err, uptimes) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(uptimes);
    });
};

exports.uptimeDetailed = function (req, res, next) {
    var startDate = new Date(parseInt(req.query['start']));
    var endDate = new Date(parseInt(req.query['end']));
    uptime.getUptimeData(req.params.monitorName, startDate, endDate, function (err, uptimes) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(uptimes);
    });
};

exports.uptimeAggregate = function (req, res, next) {
    var startDate = new Date(parseInt(req.query['start']));
    var endDate = new Date(parseInt(req.query['end']));
    var days = date_util.dateDiff(startDate, endDate, 'day');
    var prevPeriodStartDate = new Date();
    var prevPeriodEndDate = new Date();
    prevPeriodEndDate.setTime(startDate.getTime() - 1);
    prevPeriodStartDate.setTime(prevPeriodEndDate.getTime() - days * 24 * 60 * 60 * 1000);


    uptime.getUptimeDataAggregate(null, startDate, endDate, function (err, uptimes) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        else {

            uptime.getUptimeDataAggregate(null, prevPeriodStartDate, prevPeriodEndDate, function (err, uptimesprevious) {
                if (err) {
                    logger.error(err);
                    res.statusCode = 500;
                    res.send('Internal Server Error');
                    return;
                }
                else {
                    var ret = { 'current': uptimes, 'previous': uptimesprevious};
                    res.send(ret);
                }
            });
        }
    });
};

exports.uptimeAggregateByMonitor = function (req, res, next) {
    var startDate = new Date(parseInt(req.query['start']));
    var endDate = new Date(parseInt(req.query['end']));
    var days = date_util.dateDiff(startDate, endDate, 'day');
    var prevPeriodStartDate = new Date();
    var prevPeriodEndDate = new Date();
    prevPeriodEndDate.setTime(startDate.getTime() - 1);
    prevPeriodStartDate.setTime(prevPeriodEndDate.getTime() - days * 24 * 60 * 60 * 1000);
    uptime.getUptimeDataAggregate(req.params.monitorName, startDate, endDate, function (err, uptimes) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        else {

            uptime.getUptimeDataAggregate(req.params.monitorName, prevPeriodStartDate, prevPeriodEndDate, function (err, uptimesprevious) {
                if (err) {
                    logger.error(err);
                    res.statusCode = 500;
                    res.send('Internal Server Error');
                    return;
                }
                else {
                    var ret = { 'current': uptimes, 'previous': uptimesprevious };
                    res.send(ret);
                }
            });
        }
    });
};

exports.vendorCost = function (req, res, next) {
    var startDate = new Date(parseInt(req.query['start']));
    var endDate = new Date(parseInt(req.query['end']));
    vendorCostDao.getVendorCost(startDate, endDate, function (err, vendorcosts) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(vendorcosts);
    });
};
