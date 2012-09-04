if (!window.Opty) { window.Opty = {}; }

Opty.UptimeWidgetView = Backbone.View.extend({
    initialize: function (options) {
        _.bindAll(this, 'render');
        this.title = options.title;
        this.collection = options.collection;
        this.collection.on('reset', this.render);
    },

    render: function () {
        this.$el.empty();
        var widget_template = _.template(
            '<div class="widget" style="width: 220px; text-align: center;"> \
                <div class="widget-title" style="text-align: left;"><%= title %></div> \
                <div style="display: inline-block; padding-top:2px; padding-bottom:2px;"> \
                <% data.forEach(function(row) { %> \
                    <% var d = new Date(row.get("monitorDate")) %> \
                    <% var hoverText = "No downtime " + (d.getMonth()+1) + "/" + (d.getDate()) %> \
                    <% if (row.get("downtime") > 0) { %> \
                        <% hoverText = row.get("downtime") + " seconds of downtime " + (d.getMonth()+1) + "/" + (d.getDate()) %> \
                    <% } %> \
                    <% if (row.get("downtime") == 0) { %> \
                        <div title="<%=hoverText%>" class="daily-uptime-widget good-bg" style="width: <%=width%>px;"></div> \
                    <% } else { %> \
                        <% if (row.get("downtime") >= 300) { %> \
                            <div title="<%=hoverText%>" class="daily-uptime-widget bad-bg" style="width: <%=width%>px;"></div> \
                        <% } else { %> \
                            <div title="<%=hoverText%>" class="daily-uptime-widget medium-bg" style="width: <%=width%>px;"></div> \
                        <% } %> \
                    <% } %> \
                <% }); %> \
             </div></div>');

        var dpWidth = parseInt((220 - this.collection.length - 10) / this.collection.length);
        this.$el.append(widget_template({ data: this.collection, width: dpWidth, title: this.title }));

        return this.$el;
    }
});
