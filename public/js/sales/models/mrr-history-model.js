if (!window.Opty) { window.Opty = {}; }

Opty.MRRHistoryModel = Backbone.Model.extend({});

Opty.MRRHistoryCollection = Backbone.Collection.extend({
    model: Opty.MRRHistoryModel,
    url: function () {
        return '/rest/sales/mrrs?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
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

