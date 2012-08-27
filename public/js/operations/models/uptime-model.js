if (!window.Opty) { window.Opty = {}; }

Opty.UptimeModel = Backbone.Model.extend({});

Opty.UptimeCollection = Backbone.Collection.extend({
    initialize: function (attributes, options) {
        this.monitorName = options.monitorName;
        this.count = options.count;
    },
    model: Opty.UptimeModel,
    url: function () {
        if (this.monitorName) {
            if (this.count) {
                return '/ops/uptime/' + this.monitorName + '?count=' + this.count;
            }
            else {
                return '/ops/uptime/' + this.monitorName;
            }
        }
        else {
            if (this.count) {
                return '/ops/uptime' + '?count=' + this.count;
            }
            else {
                return '/ops/uptime';
            }
        }
    }
});

