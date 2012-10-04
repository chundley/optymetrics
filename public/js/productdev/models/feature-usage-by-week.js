if(!window.Opty) { window.Opty = {}; }

Opty.WeeklyFeatureUsageStatsModel = Backbone.Model.extend({});

Opty.WeeklyFeatureUsageStatsCollection = Backbone.Collection.extend({
    model: Opty.WeeklyFeatureUsageStatsModel, 
    url: function() {
        var url = '/rest/productdev/weekly-feature-usage';
        return url;
    },

    initialize: function(options) {
//        _.bindAll(this, 'reportRangeChanged');
//        Opty.pubsub.bind('reportrange:changed', this.reportRangeChanged, this);
    },

    reportRangeChanged: function(data) {
//        this.startDate = data.start;
//        this.endDate = data.end;
    }
});
