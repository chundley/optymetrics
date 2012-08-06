// Third-party includes
var application_root = __dirname,
    async = require('async'),
    csv = require('csv'),
    cronJob = require('cron').CronJob,
    util = require('util'),
    http = require('http'),
    logger = require('./util/logger'),
    path = require('path'),
    rest = require('restler'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    express = require('express');

// Application includes
var metrics_dao = require('./data_access/metrics_dao.js'),
    trello = require('./data_access/trello_api.js'),
    trello_backfill = require('./jobs/trello_backfill.js');

metrics_dao.connect();

// Run the Trello backfill hourly
var trelloBackfillJob = new cronJob("0 0 * * *", function() {
    logger.log('info','Running Trello backfill');
    trello_backfill.trelloBackfill();
});
trelloBackfillJob.start();

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

        var source = [ [ "Date", "Velocity" ] ];
        debugger;
        _.each(results, function(result) {
            var row = [];
            row.push(result.day);
            row.push(result.velocity);
            source.push(row);i
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

// Start the web server
var server = app.listen(3000);
logger.log('info', 'Server started. Listening on port 3000');

var shutdownHook = function() {
    logger.log('info','Shutting down');
    logger.log('info','Closing MongoDB connection');
    metrics_dao.disconnect();

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