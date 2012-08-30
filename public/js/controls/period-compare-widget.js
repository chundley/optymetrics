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
            '<div class="period-compare-widget"> \
                <div> \
                    <div class="period-compare-widget-title"><%= title %></div> \
                    <div class="period-compare-widget-goal"><%= goal %></div> \
                </div> \
                <div class="period-compare-widget-actual"><%= actual %></div> \
                <div> \
                    <div class="period-compare-widget-arrow-up">&#x25B2;</div> \
                    <div class="period-compare-widget-up"><%= delta %></div> \
                    <div class="period-compare-widget-period">from previous</div> \
                </div> \
                <div style="clear: both" /> \
            </div>');

        var table_template_down = _.template(
            '<div class="period-compare-widget"> \
                <div> \
                    <div class="period-compare-widget-title"><%= title %></div> \
                    <div class="period-compare-widget-goal"><%= goal %></div> \
                </div> \
                <div class="period-compare-widget-actual"><%= actual %></div> \
                <div> \
                    <div class="period-compare-widget-arrow-down">&#x25BC;</div> \
                    <div class="period-compare-widget-down"><%= delta %></div> \
                    <div class="period-compare-widget-period">from previous</div> \
                </div> \
                <div style="clear: both" /> \
            </div>');

        var table_template_neutral = _.template(
            '<div class="period-compare-widget"> \
                <div> \
                    <div class="period-compare-widget-title"><%= title %></div> \
                    <div class="period-compare-widget-goal"><%= goal %></div> \
                </div> \
                <div class="period-compare-widget-actual"><%= actual %></div> \
                <div> \
                    <div class="period-compare-widget-arrow-neutral">&#x25B6;</div> \
                    <div class="period-compare-widget-neutral"><%= delta %></div> \
                    <div class="period-compare-widget-period">from previous</div> \
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
