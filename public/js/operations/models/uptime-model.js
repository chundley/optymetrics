if (!window.Opty) { window.Opty = {}; }

Opty.UptimeModel = Backbone.Model.extend({});

Opty.UptimeCollection = Backbone.Collection.extend({
    initialize: function (attributes, options) {
        this.monitorName = options.monitorName;
        this.count = options.count;
        this.startDate = options.startDate.getTime();
        this.endDate = options.endDate.getTime();
    },
    model: Opty.UptimeModel,
    url: function () {
        if (this.monitorName) {
            console.log('/ops/uptime/' + this.monitorName + '?start=' + this.startDate + '&end=' + this.endDate);
            return '/ops/uptime/' + this.monitorName + '?start=' + this.startDate + '&end=' + this.endDate;
        }
        else {
            return '/ops/uptime?start=' + this.startDate + '&end=' + this.endDate;
        }
    }
});

