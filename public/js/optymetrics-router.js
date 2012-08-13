var opty = opty || {} ;

opty.OptyMetricsRouter = Backbone.Router.extend({ 
    routes: {
        '': 'defaultRoute',
        'engineering': 'engineeringRoute',
        'engineering/:subpage': 'engineeringRoute',
        'marketing': 'marketingRoute',
        'marketing/:subpage': 'marketingRoute',
        'product': 'productRoute',
        'product/:subpage': 'productRoute',
        'sales': 'salesRoute',
        'sales/:subpage': 'salesRoute'
    },

    initialize: function(options) {
        var me = this;

        _.bindAll(this, 
                  'defaultRoute', 
                  'engineeringRoute',
                  'marketingRoute',
                  'productRoute',
                  'salesRoute',
                  'updateNavState');
    },

    defaultRoute: function() {
        this.updateNavState();
        $('div.tab-content').empty();
    },

    engineeringRoute: function(subpage) {
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

        if(subpage) {
            _.each(nav_options, function(option) {
                option.selected = (option.url_fragment == subpage); 
            });
        }

        var engineering_view = new opty.EngineeringView({ selected: subpage });
        var optymetrics_subnav = new opty.OptyMetricSubNav({ 
            root_hash: '#engineering', 
            nav_options: nav_options 
        });

        $('div.tab-content').empty()
            .append(optymetrics_subnav.render())
            .append(engineering_view.render());
    },

    marketingRoute: function() {
        this.updateNavState('marketing');
        $('div.tab-content').empty();
    },

    productRoute: function() {
        this.updateNavState('product');
        $('div.tab-content').empty();
    },

    salesRoute: function() {
        this.updateNavState('sales');
        $('div.tab-content').empty();
    },

    updateNavState: function(tab_name) {
        $('ul.nav li').removeClass('active');
        $('ul.nav li.' + tab_name).addClass('active');
    }
});

$(function() {
    var router = new opty.OptyMetricsRouter({});
    Backbone.history.start();
});
