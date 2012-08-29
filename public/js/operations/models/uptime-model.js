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
            return '/ops/uptimeaggregate/' + this.monitorName + '?start=' + this.startDate + '&end=' + this.endDate;
        }
        else {
            return '/ops/uptimeaggregate?start=' + this.startDate + '&end=' + this.endDate;
        }
    }
});

