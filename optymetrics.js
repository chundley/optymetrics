// Third-party includes
var application_root = __dirname,
    async = require('async'),
    csv = require('csv'),
    cronJob = require('cron').CronJob,
    util = require('util'),
    url = require('url'),
    http = require('http'),
    path = require('path'),
    rest = require('restler'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    express = require('express');

// Application includes
var logger = require('./util/logger'),
    mongodb_connection = require('./util/mongodb_connection'),
    metrics_dao = require('./data_access/metrics_dao.js'),
    coredb_dao = require('./data_access/coredb_dao.js'),
    tco_dao = require('./data_access/tco_dao.js'),
    trello_backfill = require('./jobs/trello_backfill.js'),
    pingdom = require('./jobs/pingdom-job.js'),
    pingdom_api = require('./data_access/pingdom-api.js'),
    uptime = require('./data_access/uptime-dao.js'),
    tcojob = require('./jobs/tco-job.js');

// connect to Mongo - this connection will be used for all access to MongoDB
mongodb_connection.connect();

// Run the TCO backfill every 8 hours
var tcoBackfillJob = new cronJob("0 0 0,8,16 * *", function () {
    logger.log('info', 'Running TCO backfill');
    coredb_dao.tcoBackfill();
});
tcoBackfillJob.start();

// Run the Trello backfill hourly
var trelloBackfillJob = new cronJob("0 0 * * *", function() {
    logger.log('info','Running Trello backfill');
    trello_backfill.trelloBackfill();
});
trelloBackfillJob.start();

// Run the Pingdom backfill hourly (five minutes after the hour)
var pingdomJobSchedule = new cronJob('0 5 * * *', function () {
    logger.info('Running Pingdom job');
    pingdom.pingdomJob();
});
pingdomJobSchedule.start();

// The web server instance
var app = express.createServer();

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(application_root, "public")));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Fetches velocity data as JSON
app.get('/dev/velocity', function(req, res, next) {
    metrics_dao.getDeploymentVelocity(function(err, results) {
         if(err) {
            logger.log('info',err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        
        res.send(results);
    });
});

// Fetches velocity data as CSV. 
app.get('/dev/velocity/csv', function(req, res, next) {
    metrics_dao.getDeploymentVelocity(function(err, results) {
        if(err) {
            logger.log('info',err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        var source = [ [ "WeekOf", "Velocity" ] ];
        debugger;
        _.each(results, function(result) {
            var row = [];
            row.push(result.week_of);
            row.push(result.velocity);
            source.push(row);
        });

        var result = [];
        res.contentType('csv');
        
        csv().from(source)
            .on('data', function(data) {
                debugger;
                result.push(data.join(','));
            })
            .on('end', function() {
                res.setHeader('Content-disposition', 'attachment; filename=velocity.csv');
                res.setHeader('Content-type', 'application/octet-stream;charset=UTF-8');
                res.send(result.join('\n'));
            });
    });
});

// fetch TCO data
app.get('/ops/tco', function (req, res, next) {
    tco_dao.getCustomerTCOData(50, function (err, customers) {
        if (err) {
            logger.log('error', err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(customers);
    });
});

app.get('/ops/monitors', function (req, res, next) {
    pingdom_api.getAllMonitors(function (err, monitors) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(monitors);
    });
});

// fetch Uptime data (default)
app.get('/ops/uptime', function (req, res, next) {
    var params = url.parse(req.url, true).query;
    var count = 30;
    if (params.count) {
        count = params.count;
    }
    uptime.getUptimeData(null, count, function (err, uptimes) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(uptimes);
    });
});

// fetch Uptime data
// @param monitorName            which monitor to pull data for
// @param count (query string)   how many days to return (default 30)
app.get('/ops/uptime/:monitorName', function (req, res, next) {
    var params = url.parse(req.url, true).query;
    var count = 30;
    if (params.count) {
        count = params.count;
    }
    uptime.getUptimeData(req.params.monitorName, count, function (err, uptimes) {
        if (err) {
            logger.error(err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }
        res.send(uptimes);
    });
});

// Start the web server
var server = app.listen(3000);
logger.log('info', 'Server started. Listening on port 3000');

var shutdownHook = function() {
    logger.log('info','Shutting down');
    logger.log('info', 'Closing MongoDB connection');
    mongodb_connection.disconnect();
    trelloBackfillJob.stop(); 
    server.close();
};

// Handles keyboard interrupt Ctrl+C when running script via "node
// optymetrics.js"
if (process.platform != 'win32') {
    process.on('SIGINT', function () {
        shutdownHook();
    });
}

// Handles shutdown when script is run using forever "forever start
// optymetrics.js"
if (process.platform != 'win32') {
    process.on('SIGTERM', function () {
        shutdownHook();
        process.exit(0);
    });
}
