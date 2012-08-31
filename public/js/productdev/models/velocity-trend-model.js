if(!window.Opty) { window.Opty = {}; }

Opty.VelocityTrendModel = Backbone.Model.extend({});

Opty.VelocityTrendCollection = Backbone.Collection.extend({
    model: Opty.VelocityModel, 
    url: function() {
        return '/rest/productdev/velocity/trend?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
    },
    
    initialize: function(options) {
        _.bindAll(this, 'reportRangeChanged', 'url');
        Opty.pubsub.bind('reportrange:changed', this.reportRangeChanged, this);
    },

    reportRangeChanged: function(data) {
        this.startDate = data.start;
        this.endDate = data.end;
        this.fetch();
    }
});
