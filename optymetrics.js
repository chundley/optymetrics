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
    config = require('config'),
    logger = require('./util/logger.js'),
    date_util = require('./util/date_util.js'),
    mongodb_connection = require('./util/mongodb_connection.js'),
    tco_dao = require('./data_access/tco-dao.js'),
    trello_backfill = require('./jobs/trello_backfill.js'),
    uptimejob = require('./jobs/uptime-job.js'),
    incidentsDao = require('./data_access/incidents-dao.js'),
    pagerDutyJob = require('./jobs/pagerduty-job.js'),
    pingdom_api = require('./data_access/pingdom-api.js'),
    routes = require('./routes'),
    storyDao = require('./data_access/story-dao.js'),
    uptime = require('./data_access/uptime-dao.js'),
    mrrdaoTEMP = require('./data_access/mrr-dao.js'), // JUST FOR TESTING
    tcojob = require('./jobs/tco-job.js'),
    UserRoles = require('./data_access/model/auth-model.js').UserRoles,
    vendorCostJob = require('./jobs/vendor-cost-job.js'),
    vendorCostDao = require('./data_access/vendor-cost-dao.js'),
    mixpanel_backfill = require('./jobs/mixpanel_backfill.js'),
    aspen_backfill = require('./jobs/aspen_backfill.js'),
    mrrjob = require('./jobs/mrr-job.js');

// connect to Mongo - this connection will be used for all access to MongoDB
mongodb_connection.connect();

// Run the VendorCost backfill every day at 6:00 AM
var vendorCostBackfillJob = new cronJob("0 0 14 * *", function () {
    try {
        logger.info('Running Vendor cost backfill');
        vendorCostJob.vendorCostJob();
    } catch(err) {
        logger.error(err);
    }
});
vendorCostBackfillJob.start();

// Run the MRR backfill every 8 hours
var mrrBackfillJob = new cronJob("0 0 0,7,15 * *", function () {
    try {
        logger.info('Running MRR backfill');
        mrrjob.mrrJob();
    } catch (err) {
        logger.error(err);
    }
});
mrrBackfillJob.start();

// Run the TCO backfill every 8 hours
var tcoBackfillJob = new cronJob("0 0 0,8,16 * *", function () {
    try {
        logger.info('Running TCO backfill');
        tcojob.tcoJob();
    } catch(err) {
        logger.error(err);
    }
});
tcoBackfillJob.start();

// Run the Trello backfill hourly
var trelloBackfillJob = new cronJob("0 0 * * *", function() {
    try {
        logger.log('info','Running Trello backfill');
        trello_backfill.trelloBackfill();
    } catch(err) {
        logger.error(err);
    }
});
trelloBackfillJob.start();

// Run the PagerDuty backfill every 10 minutes 
var pagerDutyBackfillJob = new cronJob("0 */10 * * *", function() {
    try {
        debugger;
        logger.log('info', 'Running PagerDuty backfill');
        pagerDutyJob.pagerDutyBackfill();
    } catch(err) {
        logger.error(err);
    }
});
pagerDutyBackfillJob.start();

// Run the Pingdom backfill hourly (five minutes after the hour)
var uptimeJobSchedule = new cronJob('0 5 * * *', function () {
    try {
        logger.info('Running Uptime job');
        uptimejob.uptimeJob();
    } catch(err) {
        logger.error(err);
    }
});
uptimeJobSchedule.start();

//Run the mixpanel backfill at 7AM PST
var mixpanelJob = new cronJob("0 0 */6 * *", function () {
    try {
        logger.info('Running Mixpanel backfill');
        mixpanel_backfill.mixpanelBackfill();
    } catch(err) {
        logger.error(err);
    }
});
mixpanelJob.start();

//Run the aspen backfill job at 7AM PST
var aspenJob = new cronJob("0 0 */6 * *", function () {
    try {
        logger.info('Running Aspen backfill');
        aspen_backfill.aspenBackfill();
    } catch(err) {
        logger.error(err);
    }
});
aspenJob.start();

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
        secret: config.Auth.sessionSecret, 
        store: new MongoStore({
           db: config.Mongo.database,
           host: config.Mongo.dbHost,
           clear_interval: 3600
        }),
        cookie: {
            maxAge: 2592000000 // 30 days
        }
    }));
    app.use(app.router);
    app.use(express.static(path.join(application_root, "public")));
});

// Exposes the session variable to server-side UI templates
app.dynamicHelpers({
    session: function (req, res) {
        return req.session;
    }
});

// Authentication middleware
function requiresLogin(req, res, next) {
    if(req.session.user) {
        next();
    } else {
        res.redirect('/session/login?redir=' + req.url);
    }
};

// Authorization middleware
function requiresAdmin(req, res, next) {
    if(req.session.user && req.session.user.role === UserRoles.ADMIN) {
        next();
    } else {
       var msg = '403 - Unauthorized: ' + req.url;
       if(req.session.user) msg = msg + " User: " + req.session.user.email;
       logger.log('warn', msg);
       res.statusCode = 403;
       res.send('403 - Unauthorized');
    }
};

// Index page
app.get('/', requiresLogin, routes.index);

// App login route
app.get('/session/login', routes.session.login);

// Login post
app.post('/session/login', routes.session.loginSubmit);

// Logout route
app.get('/session/logout', requiresLogin, routes.session.logout);

// Admin route
app.get('/admin', requiresLogin, requiresAdmin, routes.admin.index);

// POST - Adds a new user
app.post('/admin/user/add', requiresLogin, requiresAdmin, routes.admin.addUser);

// GET - User profile
app.get('/profile', requiresLogin, routes.profile.index);

// POST - Change password
app.post('/profile/password/change', requiresLogin, routes.profile.changePassword);

// Gets velocity aggregated by feature group as JSON
app.get('/rest/productdev/velocity/feature', requiresLogin, routes.productdev.velocityByFeatureGroup);

// Gets story details as JSON 
app.get('/rest/productdev/stories', requiresLogin, routes.productdev.stories);

// Gets velocity data as JSON
app.get('/rest/productdev/velocity', requiresLogin, routes.productdev.velocityByWeek);

// Gets velocity trend data as JSON
app.get('/rest/productdev/velocity/trend', requiresLogin, routes.productdev.velocityTrend);

// Gets average cycle time data as JSON
app.get('/rest/productdev/cycletime', requiresLogin, routes.productdev.averageCycleTime);

//Gets customer counts by sku aggregated weekly as JSON
app.get('/rest/productdev/weekly-customer-user-stats', requiresLogin, routes.productdev.weeklyCustomerUserStats);

//Gets feature usage stats aggregated weekly as JSON
app.get('/rest/productdev/weekly-feature-usage', requiresLogin, routes.productdev.weeklyFeatureUsageStats);

//Gets feature usage stats aggregated weekly as JSON
app.get('/rest/productdev/feature-use-by-customer', requiresLogin, routes.productdev.featureUseByCustomerId);

// Gets TCO data as JSON
app.get('/ops/tco', requiresLogin, routes.operations.tco);

// Gets uptime data as JSON
app.get('/ops/monitors', requiresLogin, routes.operations.monitors);

// Gets incident data as JSON
app.get('/ops/incidents', requiresLogin, routes.operations.incidents);

// Add incident page
app.get('/ops/incident', requiresLogin, routes.operations.incident);

// Add incident page in edit mode
app.get('/ops/incident/edit/:id', requiresLogin, routes.operations.getIncident);

// Edit incident postbak
app.post('/ops/incident/edit/:id', requiresLogin, routes.operations.updateIncident);

// Adds a new incident to the system
app.post('/ops/incident', requiresLogin, routes.operations.createIncident);

// Marks an incident as hidden 
app.post('/ops/incident/hide/:id', requiresLogin, routes.operations.hideIncident);

// Gets incidents aggregated by day as JSON
app.get('/ops/incidents/aggregate', requiresLogin, routes.operations.incidentsByDay);

//Gets customer counts by sku aggregated monthly as JSON
app.get('/rest/sales/customer-history', requiresLogin, routes.sales.monthlyCustomersBySku);

//Gets raw mrrs
app.get('/rest/sales/mrrs', requiresLogin, routes.sales.mrrs);

//Gets mrrs by product type
app.get('/rest/sales/mrrs-by-product', requiresLogin, routes.sales.mrrsByProductType);

//Gets software mrrs by sku
app.get('/rest/sales/mrrs-software-by-sku', requiresLogin, routes.sales.mrrsSoftwareBySKU);

//Gets churn by product type
app.get('/rest/sales/churn-by-product', requiresLogin, routes.sales.mrrsChurnByProductType);

//Gets new business by product type
app.get('/rest/sales/new-by-product', requiresLogin, routes.sales.mrrsNewSalesByProductType);

//Gets new business by product type
app.get('/rest/sales/churn-detail', requiresLogin, routes.sales.mrrsChurnDetail);

//Gets new business by product type
app.get('/rest/sales/new-detail', requiresLogin, routes.sales.mrrsNewDetail);

//Gets sales calculator template as Html
app.get('/rest/sales/calculator', requiresLogin, routes.sales.salesCalculator);


/**
* fetch uptime data (detailed)
* @param monitorName            which monitor to pull data for
* @param start (query string)   start date (epoch)
* @param end (query string)     end date (epoch)
*/
app.get('/ops/uptime', requiresLogin, routes.operations.uptime);


/**
* fetch uptime data (detailed)
* @param monitorName            which monitor to pull data for
* @param start (query string)   start date (epoch)
* @param end (query string)     end date (epoch)
*/
app.get('/ops/uptime/:monitorName', requiresLogin, routes.operations.uptimeDetailed);

/**
* fetch uptime data aggregated for all app monitors combined
*   - dashboard, service, landing pages, api
* @param start (query string)   start date (epoch)
* @param end (query string)     end date (epoch)
*
*/
app.get('/ops/uptimeaggregate', requiresLogin, routes.operations.uptimeAggregate);

/**
* fetch Uptime data aggregated for the specified monitor
* @param monitorName            which monitor to pull data for
* @param start (query string)   start date (epoch)
* @param end (query string)     end date (epoch)
*/
app.get('/ops/uptimeaggregate/:monitorName', requiresLogin, routes.operations.uptimeAggregateByMonitor);

/**
* fetch vendor cost data (all detail)
* @param start (query string)   start date (epoch)
* @param end (query string)     end date (epoch)
*/
app.get('/ops/vendorcost', requiresLogin, routes.operations.vendorCost);

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

process.on('uncaughtException', function(err) {
    console.error(err.stack);
    throw err;
});

function backfillAdmins() { 
    authDao.addUser('Nathan Harkenrider', 'nathan@optify.net', 'optify123', UserRoles.ADMIN, function(err) {});
    authDao.addUser('Chris Hundley', 'chris@optify.net', 'optify123', UserRoles.ADMIN, function(err) {});
    authDao.addUser('Tommy Unger', 'tommy@optify.net', 'optify123', UserRoles.ADMIN, function(err) {});
};

backfillAdmins();
