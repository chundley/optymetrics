if (!window.Opty) { window.Opty = {}; }

Opty.NewSalesByProductModel = Backbone.Model.extend({});

Opty.NewSalesByProductCollection = Backbone.Collection.extend({
    model: Opty.NewSalesByProductModel,
    url: function () {
        return '/rest/sales/new-by-product?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
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

