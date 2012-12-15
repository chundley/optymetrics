if(!window.Opty) { window.Opty = {}; }

Opty.WeeklyCustomerUsageBySku = Backbone.Model.extend({});

Opty.WeeklyCustomerUsageBySku = Backbone.Collection.extend({
    model: Opty.WeeklyCustomerUsageBySku, 
    url: function() {
        var url = '/rest/productdev/weekly-customer-user-stats';
        return url;
    },

    initialize: function(options) {
        _.bindAll(this, 'reportRangeChanged');
        Opty.pubsub.bind('reportrange:changed', this.reportRangeChanged, this);
    },

    reportRangeChanged: function(data) {
        this.startDate = data.start;
        this.endDate = data.end;
    }
});
