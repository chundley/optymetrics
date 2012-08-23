var opty = opty || {};

opty.UptimeModel = Backbone.Model.extend({});

opty.UptimeCollection = Backbone.Collection.extend({
    initialize: function (attributes, options) {
        this.monitorName = options.monitorName;
        this.count = options.count;
    },
    model: opty.UptimeModel,
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

