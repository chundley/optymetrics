if (!window.Opty) { window.Opty = {}; }

/**
 * Velocity tren widget view
 */
Opty.VelocityTrendWidgetView = Backbone.View.extend({
    id: 'velocity-trend-widget',
    initialize: function (options) {
        var me = this;

        _.bindAll(me, 'render', 'widgetDataChanged');

        me.collection = options.collection;
        me.title = options.title;
        me.goal = options.goal;
        me.collection.on('reset', me.widgetDataChanged);
    },

    widgetDataChanged: function () {
        this.render();
    },

    render: function () {
        var me = this;
        this.$el.empty();

        var model = me.collection.models[0];
        var currentPoints = model.get('current').points;
        var previousPoints = model.get('previous').points;

        var updown = (currentPoints == previousPoints || isNaN(currentPoints) || isNaN(previousPoints)) ? 
            'neutral' : (previousPoints < currentPoints) ? 'up' : 'down';
        
        var widget_table = new Opty.PeriodCompareWidgetView({
            title: me.title,
            goal: me.goal,
            actual: Opty.util.formatNumber(currentPoints, 1),
            type: updown,
            delta: Opty.util.formatNumber(Math.abs(((currentPoints - previousPoints) / previousPoints) * 100), 2) + '%'
        });
        this.$el.append(widget_table.$el);
        return this.$el;
    }
});
