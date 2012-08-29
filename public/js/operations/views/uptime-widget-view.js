if (!window.Opty) { window.Opty = {}; }

/**
 * Operations uptime widget view
 */
Opty.UptimeWidgetView = Backbone.View.extend({
    id: 'operations-uptime-widget',
    initialize: function (options) {
        var me = this;

        _.bindAll(me, 'render', 'widgetDataChanged');

        me.collection = options.collection;
        me.title = options.title;
        me.goal = options.goal;
        me.period = options.period;
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
        var updown = (oldPerc == currentPerc || isNaN(currentPerc) || isNaN(oldPerc)) ? 'neutral' : (oldPerc < currentPerc) ? 'up' : 'down';
        var widget_table = new Opty.PeriodCompareWidgetView({
            title: me.title,
            goal: me.goal,
            actual: Opty.util.formatNumber(currentPerc, 3) + '%',
            type: updown,
            delta: Opty.util.formatNumber(Math.abs(oldPerc - currentPerc), 3) + '%',
            period: me.period
        });
        this.$el.append(widget_table.$el);
        return this.$el;
    }

});
