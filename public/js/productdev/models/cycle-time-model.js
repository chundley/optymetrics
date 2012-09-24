if(!window.Opty) { window.Opty = {}; }

/**
 * Cycle time data 
 */
Opty.CycleTimeModel = Backbone.Model.extend({});

Opty.CycleTimeCollection = Backbone.Collection.extend({
    model: Opty.CycleTimeModel, 
    url: function() {
        return '/rest/productdev/cycletime?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
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
