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

        /*
        var currentPerc = 0;
        var oldPerc = 0;
        var uTotal = 0, dTotal = 0;
        var count = 1;

        me.collection.each(function (model) {
            uTotal += model.get('uptime');
            dTotal += model.get('downtime');
            count++;
            if (count == 30) {
                currentPerc = uTotal / (uTotal + dTotal) * 100;
                uTotal = 0;
                dTotal = 0;
            }
        });

        // account for the case where there are less than 30 data points
        if (currentPerc > 0) {
            oldPerc = uTotal / (uTotal + dTotal) * 100;
        }
        else {
            currentPerc = uTotal / (uTotal + dTotal) * 100;
            oldPerc = currentPerc;
        }
        */

        var updown = (oldPerc == currentPerc) ? 'neutral' : (oldPerc < currentPerc) ? 'up' : 'down';
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
