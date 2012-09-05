if (!window.Opty) { window.Opty = {}; }

Opty.VendorCostModel = Backbone.Model.extend({});

Opty.VendorCostCollection = Backbone.Collection.extend({
    model: Opty.VendorCostModel,
    url: function () {
        return '/ops/vendorcost?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
    },
    initialize: function (options) {
        this.startDate = options.startDate;
        this.endDate = options.endDate;
        _.bindAll(this, 'reportRangeChanged');
        Opty.pubsub.bind('reportrange:changed', this.reportRangeChanged, this);
    },

    reportRangeChanged: function (data) {
        this.startDate = data.start;
        this.endDate = data.end;
        this.fetch();
    }
});

