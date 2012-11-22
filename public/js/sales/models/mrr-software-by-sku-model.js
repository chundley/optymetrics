if (!window.Opty) { window.Opty = {}; }

Opty.MRRSoftwareBySKUModel = Backbone.Model.extend({});

Opty.MRRSoftwareBySKUCollection = Backbone.Collection.extend({
    model: Opty.MRRSoftwareBySKUModel,
    url: function () {
        return '/rest/sales/mrrs-software-by-sku?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
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

