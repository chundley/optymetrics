if (!window.Opty) { window.Opty = {}; }

/**
 * Operations uptime widget view
 */
Opty.BigScoreWidgetView = Backbone.View.extend({
    id: 'services-bigscore-widget',
    initialize: function (options) {
        var me = this;

        _.bindAll(me, 'render', 'widgetDataChanged');

        me.collection = options.collection;
        me.cssClass = options.cssClass;
        me.header = options.header;
        me.footer = options.footer;
        me.collection.on('reset', me.widgetDataChanged);
    },
    widgetDataChanged: function () {
        this.render();
    },

    render: function () {
        var me = this;
        this.$el.empty();

        var metric = me.collection.models[me.collection.models.length-1].get('bigScore');
        var widget = new Opty.SingleMetricWidgetView({
            cssClass: me.cssClass,
            header: me.header,
            metric: metric,
            footer: me.footer
        });

        var $divTitle = $('<div class="widget-group-header-container" id="usagetableheader"><div class="widget-group-header"><span>The Big Score (TBS)</span></div></div>');
        
        this.$el.append($divTitle);
        this.$el.append(widget.$el);
        return this.$el;
    }
});
