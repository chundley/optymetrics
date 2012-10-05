if(!window.Opty) { window.Opty = {}; }

Opty.CustomerHistoryModel = Backbone.Model.extend({});

Opty.CustomerHistoryCollection = Backbone.Collection.extend({
    model: Opty.CustomerHistoryModel, 
    url: function() {
        var url = '/rest/sales/customer-history';
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
