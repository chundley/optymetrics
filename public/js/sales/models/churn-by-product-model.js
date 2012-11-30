if (!window.Opty) { window.Opty = {}; }

Opty.ChurnByProductModel = Backbone.Model.extend({});

Opty.ChurnByProductCollection = Backbone.Collection.extend({
    model: Opty.ChurnByProductModel,
    url: function () {
        return '/rest/sales/churn-by-product?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
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

