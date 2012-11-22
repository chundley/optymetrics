/*
 * GET request for home page
 */
exports.index = function(req, res, next) {
    res.render('index', {
        title: 'Optify Company Dashboard',
        scripts: [
            '/js/ext/daterangepicker.js',
            '/js/d3.v2.min.js',
            '/js/highcharts.src.js',
            '/js/client-utils.js',
            '/js/controls/table.js',
            '/js/controls/period-compare-widget.js',
            '/js/controls/date-range-view.js',
            '/js/controls/chart-widget-view.js',
            'js/controls/tri-pane-metric-widget.js',
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
            '/js/productdev/models/cycle-time-model.js',
            '/js/productdev/models/feature-group-model.js',
            '/js/productdev/models/velocity-model.js',
            '/js/productdev/models/velocity-trend-model.js',
            '/js/productdev/models/story-model.js',
            '/js/productdev/views/productdev-view.js',
            '/js/productdev/views/velocity-chart-view.js',
            '/js/productdev/views/feature-group-chart-view.js',
            '/js/productdev/views/velocity-trend-widget-view.js',
            '/js/sales/models/customer-history-model.js',
            '/js/sales/models/mrr-history-model.js',
            '/js/sales/models/mrr-by-product-model.js',
            '/js/sales/models/mrr-software-by-sku-model.js',
            '/js/sales/views/sales-chart.js',
            '/js/sales/views/sales-view.js',
            '/js/sales/views/sales-calc-view.js',
            '/js/sales/views/mrr-history-rollup-view.js',
            '/js/sales/views/mrr-history-sku-view.js',
            '/js/productdev/models/usage-by-sku.js',
            '/js/productdev/models/feature-usage-by-week.js'

        ],
    });
};

exports.admin = require('./admin.js');
exports.operations = require('./operations.js');
exports.productdev = require('./productdev.js');
exports.profile = require('./profile.js');
exports.session = require('./session.js');
exports.sales = require('./sales.js');
