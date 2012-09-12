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
var authDao = require('./data_access/auth-dao.js'), 
    logger = require('./util/logger.js'),
    date_util = require('./util/date_util.js'),
    mongodb_connection = require('./util/mongodb_connection.js'),
    tco_dao = require('./data_access/tco-dao.js'),
    trello_backfill = require('./jobs/trello_backfill.js'),
    uptimejob = require('./jobs/uptime-job.js'),
    incidentsDao = require('./data_access/incidents-dao.js'),
    pagerDutyJob = require('./jobs/pagerduty-job.js'),
    pingdom_api = require('./data_access/pingdom-api.js'),
    storyDao = require('./data_access/story-dao.js'),
    uptime = require('./data_access/uptime-dao.js'),
    tcojob = require('./jobs/tco-job.js'),
    vendorCostJob = require('./jobs/vendor-cost-job.js'),
    vendorCostDao = require('./data_access/vendor-cost-dao.js');

// connect to Mongo - this connection will be used for all access to MongoDB
mongodb_connection.connect();

// Run the VendorCost backfill every day at 6:00 AM
var vendorCostBackfillJob = new cronJob("0 0 14 * *", function () {
    logger.info('Running Vendor cost backfill');
    vendorCostJob.vendorCostJob();
});
vendorCostBackfillJob.start();

// Run the TCO backfill every 8 hours
var tcoBackfillJob = new cronJob("0 0 0,8,16 * *", function () {
    logger.info('Running TCO backfill');
    tcojob.tcoJob();
});
tcoBackfillJob.start();

// Run the Trello backfill hourly
var trelloBackfillJob = new cronJob("0 0 * * *", function() {
    logger.log('info','Running Trello backfill');
    trello_backfill.trelloBackfill();
});
trelloBackfillJob.start();

// Run the PagerDuty backfill daily at midnight PST
var pagerDutyBackfillJob = new cronJob("0 0 7 * *", function() {
    logger.log('info', 'Running PagerDuty backfill');
    pagerDutyJob.pagerDutyBackfill();
});
pagerDutyBackfillJob.start();

// Run the Pingdom backfill hourly (five minutes after the hour)
var uptimeJobSchedule = new cronJob('0 5 * * *', function () {
    logger.info('Running Uptime job');
    uptimejob.uptimeJob();
});
uptimeJobSchedule.start();

// The web server instance
var app = express.createServer();

var MongoStore = require('connect-mongo')(express);

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'asdfasklfjaljsdlfihlkjasdf', // TODO: CONFIG
        store: new MongoStore({
           db: 'optymetrics'                  // TODO: CONFIG 
        })
    }));
    app.use(app.router);
    app.use(express.static(path.join(application_root, "public")));
});

app.dynamicHelpers({
    session: function (req, res) {
        return req.session;
    }
});

// TODO: Move routes into a separate file

// Security route middleware
function requiresLogin(req, res, next) {
    debugger;
    if(req.session.user) {
        next();
    } else {
        res.redirect('/sessions/new?redir=' + req.url);
    }
};

// App login route
app.get('/sessions/new', function(req, res, next) {
    res.render('login', { 
        title: 'Login', 
        scripts: [],
        message: null
    });
});

// Login post
app.post('/sessions/new', function(req, res, next) {
    authDao.getUser(
        req.body.email,
        req.body.password,
        function(err, user) {
            // Auth failed 
            if(!user) {
                res.render('login', {
                    title: 'Login',
                    scripts: [],
                    message: {
                        content: 'Invalid email or password',
                        level: 'error'
                    }
                });
                
                return;
            }

            // Auth successful
            req.session.userAuthenticated=true
            req.session.user = { email: user.email, role: user.role };

            if(req.query.redir) {
                res.redirect(req.query.redir);
            } else {
                res.redirect('/');
            }
        }
    );
});

// Logout route
app.get('/sessions/logout', requiresLogin, function(req, res, next) {
    req.session.destroy();
    res.redirect('/');
});

// Default app route
app.get('/', requiresLogin, function(req, res, next) {
    res.render('index', {
        title: 'Optify Company Dashboard',
        scripts: [
            '/js/ext/date.js',
            '/js/ext/daterangepicker.js',
            '/js/d3.v2.min.js',
            '/js/highcharts.src.js',
            '/js/client-utils.js',
            '/js/controls/table.js',
            '/js/controls/period-compare-widget.js',
            '/js/controls/date-range-view.js',
            '/js/controls/chart-widget-view.js',
            '/js/optymetrics-router.js',
            '/js/optymetrics-subnav.js',
            '/js/default/views/default-view.js',
            '/js/operations/models/incidents-aggregate-model.js',
            '/js/operations/models/incidents-model.js',
            '/js/operations/models/tco-model.js',
            '/js/operations/models/uptime-aggregate-model.js',
            '/js/operations/models/uptime-model.js',
            '/js/operations/models/vendor-cost-model.js',
            '/js/operations/views/incidents-chart-view.js',
            '/js/operations/views/operations-view.js',
            '/js/operations/views/tcotable-view.js',
            '/js/operations/views/uptime-aggregate-widget-view.js',
            '/js/operations/views/uptime-widget-view.js',
            '/js/operations/views/operations-cost-chart-view.js',
            '/js/operations/views/category-cost-chart-view.js',
            '/js/operations/views/vendor-cost-chart-view.js',
            '/js/productdev/models/feature-group-model.js',
            '/js/productdev/models/velocity-model.js',
            '/js/productdev/models/velocity-trend-model.js',
            '/js/productdev/models/story-model.js',
            '/js/productdev/views/productdev-view.js',
            '/js/productdev/views/velocity-chart-view.js',
            '/js/productdev/views/feature-group-chart-view.js',
            '/js/productdev/views/velocity-trend-widget-view.js'
        ],
    });
});
  
app.get('/rest/productdev/velocity/feature', requiresLogin, function(req, res, next) {
    var startDate = new Date(parseInt(req.query['start']));
    var endDate = new Date(parseInt(req.query['end']));
    
    storyDao.getPointsByFeatureGroup(startDate, endDate, function(err, results) {
        if(err) {
            logger.log('error', err);
            res.statusCode = 500;
            res.send('InternalServerError');
            return;
        }
        res.send(results);
    });
});

app.get('/rest/productdev/stories', requiresLogin, function(req, res, next) {
    var startDate, endDate, featureGroup;
    if(req.query['start']) {
        startDate = new Date(parseInt(req.query['start']));
    }
    if(req.query['end']) {
        endDate = new Date(parseInt(req.query['end']));
    }
    if(req.query['fg']) {
        featureGroup = req.query['fg'];
    }

    storyDao.getStories(startDate, endDate, featureGroup, function(err, results) {
        if(err) {
            logger.log('error', err);
            res.statusCode = 500;
            res.send('InternalServerError');
            return;
        }
        res.send(results);
    });
});

// Fetches velocity data as JSON
app.get('/rest/productdev/velocity', requiresLogin, function(req, res, next) {
    var startDate = new Date(parseInt(req.query['start']));
    var endDate = new Date(parseInt(req.query['end']));
    
    storyDao.getDeploymentVelocity(startDate, endDate, function(err, results) {
         if(err) {
            logger.log('info',err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
});

// Fetches velocity trend data as JSON
app.get('/rest/productdev/velocity/trend', requiresLogin, function(req, res, next) {
    var startDate = new Date(parseInt(req.query['start']));
    var endDate = new Date(parseInt(req.query['end']));
    
    storyDao.getVelocityTrend(startDate, endDate, function(err, results) {
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
app.get('/rest/productdev/velocity/csv', requiresLogin, function(req, res, next) {
    storyDao.getDeploymentVelocity(function(err, results) {
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
app.get('/ops/tco', requiresLogin, function (req, res, next) {
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
});

app.get('/ops/monitors', requiresLogin, function (req, res, next) {
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

/**
 * Gets incidents between start and end 
 */
app.get('/ops/incidents', requiresLogin, function(req, res, next) {
    var startDate = new Date(parseInt(req.query['start']));
    var endDate = new Date(parseInt(req.query['end']));

    incidentsDao.getIncidents(startDate, endDate, function(err, results) {
         if(err) {
            logger.log('info',err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
});

/**
 * Gets incident counts aggregated by day between start and end
 */
app.get('/ops/incidents/aggregate', requiresLogin, function(req, res, next) {
    var startDate = new Date(parseInt(req.query['start']));
    var endDate = new Date(parseInt(req.query['end']));

    incidentsDao.getIncidentAggregate(startDate, endDate, function(err, results) {
         if(err) {
            logger.log('info',err);
            res.statusCode = 500;
            res.send('Internal Server Error');
            return;
        }

        res.send(results);
    });
});

/**
* fetch uptime data (detailed)
* @param monitorName            which monitor to pull data for
* @param start (query string)   start date (epoch)
* @param end (query string)     end date (epoch)
*/
app.get('/ops/uptime', requiresLogin, function (req, res, next) {
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
});


/**
* fetch uptime data (detailed)
* @param monitorName            which monitor to pull data for
* @param start (query string)   start date (epoch)
* @param end (query string)     end date (epoch)
*/
app.get('/ops/uptime/:monitorName', requiresLogin, function (req, res, next) {
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
});

/**
* fetch uptime data aggregated for all app monitors combined
*   - dashboard, service, landing pages, api
* @param start (query string)   start date (epoch)
* @param end (query string)     end date (epoch)
*
*/
app.get('/ops/uptimeaggregate', requiresLogin, function (req, res, next) {
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
});

/**
* fetch Uptime data aggregated for the specified monitor
* @param monitorName            which monitor to pull data for
* @param start (query string)   start date (epoch)
* @param end (query string)     end date (epoch)
*/
app.get('/ops/uptimeaggregate/:monitorName', requiresLogin, function (req, res, next) {
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
});

/**
* fetch vendor cost data (all detail)
* @param start (query string)   start date (epoch)
* @param end (query string)     end date (epoch)
*/
app.get('/ops/vendorcost', requiresLogin, function (req, res, next) {
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
