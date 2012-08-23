var opty = opty || {};

opty.PeriodCompareWidgetView = Backbone.View.extend({
    //className: 'period-compare-widget',
    //tagName: 'div',

    initialize: function (options) {
        _.bindAll(this, 'render'); //, 'dataChanged');

        //this.collection = options.collection;
        //this.table_fields = options.table_fields;

        //this.collection.on('reset', this.dataChanged);
        this.render();
    },

    render: function () {
        this.$el.empty();

        var table_template = _.template(
            '<div class="period-compare-widget"> \
                <div> \
                    <div class="period-compare-widget-title">dashboard uptime</div> \
                    <div class="period-compare-widget-goal">99.99%</div> \
                </div> \
                <div class="period-compare-widget-actual">99.981%</div> \
                <div> \
                    <div class="period-compare-widget-arrow-down">&#x25BC;</div> \
                    <div class="period-compare-widget-down">0.008%</div> \
                    <div class="period-compare-widget-period">30 days</div> \
                </div> \
                <div style="clear: both;" /> \
            </div>');

        this.$el.append(table_template());
        
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
