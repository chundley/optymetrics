if (!window.Opty) { window.Opty = {}; }

Opty.SingleMetricWidgetView = Backbone.View.extend({
    initialize: function (options) {
        _.bindAll(this, 'render');
        
        this.cssClass = options.cssClass;
        this.header = options.header;
        this.metric = options.metric;
        this.footer = options.footer;
        
        this.render();
    },

    render: function () {
        this.$el.empty();

        var widget_template = _.template(
            '<div class="<%= cssClass %>"> \
                <div class="widget-simple"> \
                    <div class="header"> \
                        <%= header %> \
                    </div> \
                    <div class="metric"> \
                        <%= metric %> \
                    </div> \
                    <div class="footer"> \
                        <%= footer %> \
                    </div> \
                </div> \
            </div>');
        
        this.$el.append(widget_template({ cssClass: this.cssClass, header: this.header, metric: this.metric, footer: this.footer }));

        return this.$el;
    }
});
