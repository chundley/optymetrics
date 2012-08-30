if (!window.Opty) { window.Opty = {}; }

Opty.UptimeWidgetView = Backbone.View.extend({
    initialize: function (options) {
        _.bindAll(this, 'render');

        this.collection = options.collection;
        this.render();
    },

    render: function () {
        this.$el.empty();
        var widget_template = _.template(
            '<div style="width: 280px; min-width: 280px;"> \
            <% console.log(data) %> \
                <% data.forEach(function(row) { %> \
                <% console.log(row.get("uptime")) %> \
                    <div style="height: 30px; min-height: 30px; border-right: 1px solid white; background-color: #00ff00; float:left">X</div> \
                <% }); %> \
             </div>');


        this.$el.append(widget_template({ data: this.collection.models }));

        return this.$el;
    }
});
