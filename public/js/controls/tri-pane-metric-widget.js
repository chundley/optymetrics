if (!window.Opty) { window.Opty = {}; }

Opty.TriPanelMetricWidgetView = Backbone.View.extend({
    initialize: function (options) {
        _.bindAll(this, 'render');

        this.collection = options.collection;
        this.group = options.group;
        this.header = options.header;
        this.footer = options.footer;
        
        this.render();
    },

    render: function () {
        this.$el.empty();

        var widget_template = _.template(
            '<div class="row"> \
                <div class="span9"> \
                    <div class="widget-group-header-container"> \
                        <div class="widget-group-header"> \
                        <span>SALES</span> \
                        </div> \
                    </div> \
                </div> \
            </div> \
            <div class="row"> \
                <div class="span3"> \
                    <div class="widget-simple"> \
                        <div class="header"> \
                        Last Month \
                        </div> \
                        <div class="metric"> \
                        $12,289 \
                        </div> \
                        <div class="footer"> \
                        MRR \
                        </div> \
                    </div> \
                </div> \
                <div class="span3"> \
                    <div class="widget-simple"> \
                        <div class="header"> \
                        This Month \
                        </div> \
                        <div class="metric"> \
                        $9,774 \
                        </div> \
                        <div class="footer"> \
                        MRR \
                        </div> \
                    </div> \
                </div> \
                <div class="span3"> \
                    <div class="widget-simple"> \
                        <div class="header"> \
                        Trend \
                        </div> \
                        <div class="trendchart" id="mrrtrend"></div> \
                    </div> \
                </div> \
            </div>');


        this.$el.append(widget_template({ collection: this.collection, group: this.group, header: this.header, footer: this.footer }));

        return this.$el;
    }
});
