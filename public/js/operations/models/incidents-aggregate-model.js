if (!window.Opty) { window.Opty = {}; }

Opty.IncidentsAggregateModel = Backbone.Model.extend({});

Opty.IncidentsAggregateCollection = Backbone.Collection.extend({
    model: Opty.IncidentsAggregateModel,
    url: function () {
        var st = Date.UTC(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
        var ed = Date.UTC(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate(), 23, 59, 59);

        return '/ops/incidents/aggregate?start=' + st + '&end=' + ed;
    },
    initialize: function (options) {
        var me = this;

        this.startDate = options.startDate;
        this.endDate = options.endDate;
        _.bindAll(this, 'reportRangeChanged', 'getStartDate', 'getEndDate');
        Opty.pubsub.bind('reportrange:changed', this.reportRangeChanged, this);
        Opty.pubsub.bind('incident:add', function() { me.fetch(); }, this);
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

