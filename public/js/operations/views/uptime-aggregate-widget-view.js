if (!window.Opty) { window.Opty = {}; }

/**
 * Operations uptime widget view
 */
Opty.UptimeAggregateWidgetView = Backbone.View.extend({
    id: 'operations-uptime-widget',
    initialize: function (options) {
        var me = this;

        _.bindAll(me, 'render', 'widgetDataChanged');

        me.collection = options.collection;
        me.cssClass = options.cssClass;
        me.header = options.header;
        me.footer = options.footer;
        me.current = options.current;
        me.collection.on('reset', me.widgetDataChanged);
    },
    widgetDataChanged: function () {
        this.render();
    },

    render: function () {
        var me = this;
        this.$el.empty();

        var model = me.collection.models[0];
        var currentPerc = model.get('current').uptime / (model.get('current').uptime + model.get('current').downtime) * 100;
        var oldPerc = model.get('previous').uptime / (model.get('previous').uptime + model.get('previous').downtime) * 100;
        
        if (Math.abs(currentPerc - oldPerc) < .001) {
            currentPerc = oldPerc;
        }
        var metric = 0;

        if (me.current) {
            metric = currentPerc;
        }
        else {
            metric = oldPerc;
        }
        var digits = 3;
        if (metric == 100) {
            digits = 0;
        }
        var widget = new Opty.SingleMetricWidgetView({
            cssClass: me.cssClass,
            header: me.header,
            metric: Opty.util.formatNumber(metric, digits) + '%',
            footer: me.footer
        });

        this.$el.append(widget.$el);
        return this.$el;
    }
});
