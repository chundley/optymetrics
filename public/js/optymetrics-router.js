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
        var Optymetrics_subnav = new Opty.OptyMetricSubNav({
            root_hash: '#'
        });

        $('div.tab-content').empty()
            .append(Optymetrics_subnav.render())
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
                url_fragment: 'story-detail',
                title: 'Story Detail'
            },
            {
                url_fragment: 'bug-metrics',
                title: 'Bug Metrics'
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
            url_fragment: 'overview',
            title: 'Overview',
            selected: true // default
        },
        {
            url_fragment: 'uptime',
            title: 'Uptime'
        },
        {
            url_fragment: 'tco',
            title: 'TCO'
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

    salesRoute: function () {
        this.updateNavState('sales');
        $('div.tab-content').empty();
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
