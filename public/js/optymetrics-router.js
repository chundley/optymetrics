if(!window.Opty) { window.Opty = {}; }

Opty.OptyMetricsRouter = Backbone.Router.extend({
    routes: {
        '': 'defaultRoute',
        'engineering': 'engineeringRoute',
        'engineering/:subpage': 'engineeringRoute',
        'marketing': 'marketingRoute',
        'marketing/:subpage': 'marketingRoute',
        'operations': 'operationsRoute',
        'operations/:subpage': 'operationsRoute',
        'product': 'productRoute',
        'product/:subpage': 'productRoute',
        'sales': 'salesRoute',
        'sales/:subpage': 'salesRoute'
    },

    initialize: function (options) {
        var me = this;

        _.bindAll(this,
                  'defaultRoute',
                  'engineeringRoute',
                  'marketingRoute',
                  'operationsRoute',
                  'productRoute',
                  'salesRoute',
                  'updateNavState');
    },

    defaultRoute: function () {
        this.updateNavState();
        $('div.tab-content').empty();
    },

    engineeringRoute: function (subpage) {
        this.updateNavState('engineering');

        var nav_options = [
            {
                url_fragment: 'sprint-metrics',
                title: 'Sprint Metrics',
                selected: true // default
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

        var engineering_view = new Opty.EngineeringView({ selected: subpage });
        var optymetrics_subnav = new opty.OptyMetricSubNav({
            root_hash: '#engineering',
            nav_options: nav_options
        });

        $('div.tab-content').empty()
            .append(optymetrics_subnav.render())
            .append(engineering_view.render());
    },

    marketingRoute: function () {
        this.updateNavState('marketing');
        $('div.tab-content').empty();
    },

    operationsRoute: function (subpage) {
        this.updateNavState('operations');
        var nav_options = [
        {
            url_fragment: 'overview-metrics',
            title: 'Overview',
            selected: true // default
        },
        {
            url_fragment: 'tco-metrics',
            title: 'TCO'
        }
        ];

        if (subpage) {
            _.each(nav_options, function (option) {
                option.selected = (option.url_fragment == subpage);
            });
        }

        var operations_view = new opty.OperationsView({ selected: subpage });

        var optymetrics_subnav = new opty.OptyMetricSubNav({
            root_hash: '#operations',
            nav_options: nav_options
        });

        $('div.tab-content').empty()
          .append(optymetrics_subnav.render())
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
