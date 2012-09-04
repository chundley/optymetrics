if (!window.Opty) { window.Opty = {}; }

Opty.PeriodCompareWidgetView = Backbone.View.extend({
    initialize: function (options) {
        _.bindAll(this, 'render');

        this.title = options.title;
        this.goal = options.goal;
        this.actual = options.actual;
        this.type = options.type;
        this.delta = options.delta;
        this.render();
    },

    render: function () {
        this.$el.empty();

        var table_template_up = _.template(
            '<div class="widget" style="width: 220px; height: 110px;"> \
                <div> \
                    <div class="widget-title-metric"><%= title %></div> \
                    <div class="widget-subtitle-metric"><%= goal %></div> \
                </div> \
                <div class="widget-body-metric"><%= actual %></div> \
                <div> \
                    <div class="widget-footnote-metric" style="color: #018c43;">&#x25B2;<%= delta %></div> \
                    <div class="widget-footnote-subtitle-metric">from previous</div> \
                </div> \
                <div style="clear: both" /> \
            </div>');

        var table_template_down = _.template(
            '<div class="widget" style="width: 220px; height: 110px;"> \
                <div> \
                    <div class="widget-title-metric"><%= title %></div> \
                    <div class="widget-subtitle-metric"><%= goal %></div> \
                </div> \
                <div class="widget-body-metric"><%= actual %></div> \
                <div> \
                    <div class="widget-footnote-metric" style="color: #ee1c24;">&#x25BC;<%= delta %></div> \
                    <div class="widget-footnote-subtitle-metric">from previous</div> \
                </div> \
                <div style="clear: both" /> \
            </div>');

        var table_template_neutral = _.template(
            '<div class="widget" style="width: 220px; height: 110px;"> \
                <div> \
                    <div class="widget-title-metric"><%= title %></div> \
                    <div class="widget-subtitle-metric"><%= goal %></div> \
                </div> \
                <div class="widget-body-metric"><%= actual %></div> \
                <div> \
                    <div class="widget-footnote-metric" style="color: #4e4e4e;">&#x25B6;<%= delta %></div> \
                    <div class="widget-footnote-subtitle-metric">from previous</div> \
                </div> \
                <div style="clear: both" /> \
            </div>');

        if (this.type == 'up') {
            this.$el.append(table_template_up({ title: this.title, goal: this.goal, actual: this.actual, delta: this.delta }));
        }
        else if (this.type == 'down') {
            this.$el.append(table_template_down({ title: this.title, goal: this.goal, actual: this.actual, delta: this.delta }));
        }
        else {
            this.$el.append(table_template_neutral({ title: this.title, goal: this.goal, actual: this.actual, delta: this.delta }));
        }

        return this.$el;
    }
});
