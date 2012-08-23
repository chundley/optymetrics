var opty = opty || {};

opty.PeriodCompareWidgetView = Backbone.View.extend({
    //className: 'period-compare-widget',
    //tagName: 'div',

    initialize: function (options) {
        _.bindAll(this, 'render'); //, 'dataChanged');

        this.title = options.title;
        this.goal = options.goal;
        this.actual = options.actual;
        this.type = options.type;
        this.delta = options.delta;
        this.period = options.period;
        //this.collection = options.collection;
        //this.table_fields = options.table_fields;

        //this.collection.on('reset', this.dataChanged);
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
                    <div class="period-compare-widget-period"><%= period %></div> \
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
                    <div class="period-compare-widget-period"><%= period %></div> \
                </div> \
                <div style="clear: both" /> \
            </div>');

        if (this.type == 'up') {
            this.$el.append(table_template_up({ title: this.title, goal: this.goal, actual: this.actual, delta: this.delta, period: this.period }));
        }
        else {
            this.$el.append(table_template_down({ title: this.title, goal: this.goal, actual: this.actual, delta: this.delta, period: this.period }));
        }

        /*
        var header_template = _.template(
        '<thead><tr> \
        <% _.each(table_fields, function(header) { %> \
        <th class="<%= header.field %>" style="text-align: <%= header.text_align %>;"><%= header.display_name %></th> \
        <% }); %> \
        </tr></thead>');

        this.$el.append(header_template({ table_fields: this.table_fields }));

        var body_template = _.template(
        '<tbody> \
        <% data.forEach(function(row) { %> \
        <tr> \
        <% _.each(table_fields, function(field) { %> \
        <td style="text-align: <%= field.text_align %>;"><%= (field.formatter) ? field.formatter(row.get(field.field)) : row.get(field.field) %></td> \
        <% }); %> \
        </tr> \
        <% }); %> \
        </tbody>');

        this.$el.append(body_template({ table_fields: this.table_fields, data: this.collection }));
        */
        return this.$el;
    }
});
