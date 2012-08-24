if(!window.Opty) { window.Opty = {}; }

/**
 * Points by feature group 
 */
Opty.FeatureGroupModel = Backbone.Model.extend({});

Opty.FeatureGroupCollection = Backbone.Collection.extend({
    model: Opty.FeatureGroupModel, 
    url: function() {
        return '/rest/productdev/velocity/feature?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
    },

    initialize: function(options) {
        _.bindAll(this, 'reportRangeChanged');
        Opty.pubsub.bind('reportrange:changed', this.reportRangeChanged, this); 
    },

    reportRangeChanged: function(data) {
        this.startDate = data.start;
        this.endDate = data.end;
        this.fetch();
    }
});
