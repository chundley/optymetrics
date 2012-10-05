if(!window.Opty) { window.Opty = {}; }

Opty.WeeklyFeatureUsageStatsModel = Backbone.Model.extend({});

Opty.WeeklyFeatureUsageStatsCollection = Backbone.Collection.extend({
    model: Opty.WeeklyFeatureUsageStatsModel, 
    url: function() {
        var url = '/rest/productdev/weekly-feature-usage';
        return url;
    },

    initialize: function(options) {
    },

    reportRangeChanged: function(data) {
    }
});
