if (!window.Opty) { window.Opty = {}; }

Opty.IncidentsModel = Backbone.Model.extend({});

Opty.IncidentsCollection = Backbone.Collection.extend({
    model: Opty.IncidentsModel,
    url: function () {
        return '/ops/incidents?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
    },
    initialize: function (options) {
        this.startDate = options.startDate;
        this.endDate = options.endDate;
        _.bindAll(this, 'reportRangeChanged', 'getStartDate', 'getEndDate');
        Opty.pubsub.bind('reportrange:changed', this.reportRangeChanged, this);
    },

    reportRangeChanged: function (data) {
        this.startDate = data.start;
        this.endDate = data.end;
        this.fetch();
    },

    getStartDate: function() {
        return this.startDate;
    },

    getEndDate: function() {
        return this.endDate;
    }
});

