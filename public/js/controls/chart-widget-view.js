if (!window.Opty) { window.Opty = {}; }

Opty.ChartWidgetView = Backbone.View.extend({
    className: 'widget-white',
    initialize: function (options) {
        var me = this;
        me.options = options;
        _.bindAll(this, 'render');
        me.render();
    },

    render: function () {
        var me = this;
        this.$el.append(me.options.chart.$el);
        return this.$el;
    },
});
