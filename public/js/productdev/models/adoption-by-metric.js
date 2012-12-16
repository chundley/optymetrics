if (!window.Opty) { window.Opty = {}; }

Opty.AdoptionByMetric = Backbone.Model.extend({});

Opty.AdoptionByMetricCollection = Backbone.Collection.extend({
    model: Opty.AdoptionByMetric,
    url: function () {
        return '/rest/productdev/adoption-by-metric?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime() + '&metric=' + this.metric;
    },
    initialize: function (options) {
        this.startDate = options.startDate;
        this.endDate = options.endDate;
        this.metric = options.metric;
        _.bindAll(this, 'reportRangeChanged');
        Opty.pubsub.bind('reportrange:changed', this.reportRangeChanged, this);
    },

    reportRangeChanged: function (data) {
        this.startDate = data.start;
        this.endDate = data.end;
        this.fetch();
    }
});
