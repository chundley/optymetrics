if(!window.Opty) { window.Opty = {}; }

Opty.pubsub = {};
_.extend(Opty.pubsub, Backbone.Events);

Opty.OptyMetricsRouter = Backbone.Router.extend({
    routes: {
        '': 'defaultRoute',
        'marketing': 'marketingRoute',
        'marketing/:subpage': 'marketingRoute',
        'operations': 'operationsRoute',
        'operations/:subpage': 'operationsRoute',
        'productdev': 'productdevRoute',
        'productdev/:subpage': 'productdevRoute',
        'sales': 'salesRoute',
        'sales/:subpage': 'salesRoute'
    },

    initialize: function (options) {
        var me = this;

        _.bindAll(this,
                  'defaultRoute',
                  'marketingRoute',
                  'operationsRoute',
                  'productdevRoute',
                  'salesRoute',
                  'updateNavState');
    },

    defaultRoute: function () {
        this.updateNavState('default');
        
        var default_view = new Opty.DefaultView({});
        
        $('div.tab-content').empty()
            .append(default_view.render());
    },

    productdevRoute: function (subpage) {
        this.updateNavState('productdev');

        var nav_options = [
            {
                url_fragment: 'overview',
                title: 'Overview',
                selected: true // default
            },
            {
                url_fragment: 'feature-groups',
                title: 'Feature Groups'
            },
            {
                url_fragment: 'velocity',
                title: 'Velocity'
            },
            {
                url_fragment: 'usage',
                title: 'Usage'
            }
        ];

        if (subpage) {
            _.each(nav_options, function (option) {
                option.selected = (option.url_fragment == subpage);
            });
        }

        var productdev_view = new Opty.ProductDevView({ selected: subpage });
        var Optymetrics_subnav = new Opty.OptyMetricSubNav({
            root_hash: '#productdev',
            nav_options: nav_options
        });

        $('div.tab-content').empty()
            .append(Optymetrics_subnav.render())
            .append(productdev_view.render());
    },

    marketingRoute: function () {
        this.updateNavState('marketing');
        $('div.tab-content').empty();
    },

    operationsRoute: function (subpage) {
        this.updateNavState('operations');
        var nav_options = [
        {
            url_fragment: 'uptime',
            title: 'Uptime',
            selected: true // default
        },
        {
            url_fragment: 'vendor',
            title: 'Vendor Cost'
        },
        {
            url_fragment: 'tco',
            title: 'Customer Cost'
        },
        {
            url_fragment: 'incidents',
            title: 'Incidents'
        }
        ];

        if (subpage) {
            _.each(nav_options, function (option) {
                option.selected = (option.url_fragment == subpage);
            });
        }

        var operations_view = new Opty.OperationsView({ selected: subpage });

        var Optymetrics_subnav = new Opty.OptyMetricSubNav({
            root_hash: '#operations',
            nav_options: nav_options
        });

        $('div.tab-content').empty()
          .append(Optymetrics_subnav.render())
          .append(operations_view.render());
    },

    productRoute: function () {
        this.updateNavState('product');
        $('div.tab-content').empty();
    },

    salesRoute: function (subpage) {
        this.updateNavState('sales');
        var nav_options = [
            {
                url_fragment: 'customers',
                title: 'Customers',
                selected: true // default
            },
            {
                url_fragment: 'price',
                title: 'Price Estimator'
            }
        ];

        if (subpage) {
            _.each(nav_options, function (option) {
                option.selected = (option.url_fragment == subpage);
            });
        }

        var sales_view = new Opty.SalesView({ selected: subpage });
        var Optymetrics_subnav = new Opty.OptyMetricSubNav({
            root_hash: '#sales',
            nav_options: nav_options
        });

        $('div.tab-content').empty()
            .append(Optymetrics_subnav.render())
            .append(sales_view.render());
    },

    updateNavState: function (tab_name) {
        $('ul.nav li').removeClass('active');
        $('ul.nav li.' + tab_name).addClass('active');
    }
});

$(function() {
    var router = new Opty.OptyMetricsRouter({});
    Backbone.history.start();
});
