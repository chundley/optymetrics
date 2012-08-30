if (!window.Opty) { window.Opty = {}; }

Opty.UptimeModel = Backbone.Model.extend({});

Opty.UptimeCollection = Backbone.Collection.extend({
    model: Opty.UptimeModel,
    url: function () {
        if (this.monitorName) {
            return '/ops/uptime/' + this.monitorName + '?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
        }
        else {
            // this is not supported in this version
            return '/ops/uptime?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
        }
    },
    initialize: function (options) {
        this.monitorName = options.monitorName;
        _.bindAll(this, 'reportRangeChanged');
        Opty.pubsub.bind('reportrange:changed', this.reportRangeChanged, this);
    },
    comparator: function (uptime) {
        var date = new Date(uptime.get('monitorDate'));
        return date.getTime();
    },
    reportRangeChanged: function (data) {
        this.startDate = data.start;
        this.endDate = data.end;
        this.fetch();
    }
});

