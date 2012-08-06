var opty = opty || {} ;

opty.OptyMetricsRouter = Backbone.Router.extend({ 
    routes: {
        '': 'defaultRoute',
        'engineering': 'engineeringRoute'
    },

    initialize: function(options) {
        var me = this;

        _.bindAll(this, 'defaultRoute', 'engineeringRoute');
    },

    defaultRoute: function() {
        $('ul.app-tabs li').removeClass('active');
        $('ul.app-tabs li.home').addClass('active');
    },

    engineeringRoute: function() {
        $('ul.app-tabs li').removeClass('active');
        $('ul.app-tabs li.engineering').addClass('active');
    }
});

$(function() {
    var router = new opty.OptyMetricsRouter({});
    Backbone.history.start();
});
