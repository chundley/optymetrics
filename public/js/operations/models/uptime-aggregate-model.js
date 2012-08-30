if (!window.Opty) { window.Opty = {}; }

Opty.UptimeAggregateModel = Backbone.Model.extend({});

Opty.UptimeAggregateCollection = Backbone.Collection.extend({
    model: Opty.UptimeAggregateModel,
    url: function () {
        if (this.monitorName) {
            return '/ops/uptimeaggregate/' + this.monitorName + '?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
        }
        else {
            return '/ops/uptimeaggregate?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
        }
    },
    initialize: function (options) {
        this.monitorName = options.monitorName;
        _.bindAll(this, 'reportRangeChanged');
        Opty.pubsub.bind('reportrange:changed', this.reportRangeChanged, this);
    },

    reportRangeChanged: function (data) {
        this.startDate = data.start;
        this.endDate = data.end;
        this.numDays = 22;
        this.fetch();
    }
});

