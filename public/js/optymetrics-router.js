var opty = opty || {} ;

opty.OptyMetricsRouter = Backbone.Router.extend({ 
    routes: {
        '': 'defaultRoute',
        'engineering': 'engineeringRoute'
    },

    initialize: function(options) {
        var me = this;

        _.bindAll(this, 'defaultRoute', 'engineeringRoute', 'updateNavTabState');
    },

    defaultRoute: function() {
        this.updateNavTabState('home');

        $('div.tab-content').empty();
    },

    engineeringRoute: function() {
        this.updateNavTabState('engineering');
        
        var velocity_collection = new opty.VelocityCollection();
        var velocity_chart = new opty.VelocityChart({ collection: velocity_collection });
       
        $('div.tab-content').empty()
            .append(velocity_chart.$el);

        velocity_collection.fetch();
    },

    updateNavTabState: function(tab_name) {
        $('ul.app-tabs li').removeClass('active');
        $('ul.app-tabs li.' + tab_name).addClass('active');
    }
});

$(function() {
    var router = new opty.OptyMetricsRouter({});
    Backbone.history.start();
});
