if (!window.Opty) { window.Opty = {}; }

Opty.CustomerSiteView = Backbone.View.extend({
    initialize: function (options) {
        var me = this;
        _.bindAll(me, 'render');
        me.collection = options.collection;
        me.collection.on('reset', this.render);
    },

    render: function () {
        this.$el.empty();

        var widget_template = _.template(' \
            <table class="table table-striped table-bordered table-condensed"> \
            <thead style="background: #343434; color: #eeeeee"> \
            <tr> \
                <th>Name</th> \
                <th>Domain</th> \
                <th style="text-align: right;">Date created</th> \
                <th style="text-align: right;">Visitors (30d)</th> \
                <th style="text-align: right;">Keywords</th> \
                <th style="text-align: right;">TCO Traffic</th> \
                <th style="text-align: right;">TCO Keywords</th> \
                <th style="text-align: right;">Total TCO</th> \
            </tr> \
            </thead> \
            <% _.each(sites, function(site) { %> \
                <% var date = new Date(site.createdAt); %> \
                <tr> \
                    <td> <%= site.name %> </td> \
                    <td> <%= site.siteDomain %> </td> \
                    <td style="text-align: right;"> <%= date.getFullYear() + "-" + Opty.util.padNumber(date.getMonth() + 1, 2) + "-" + Opty.util.padNumber(date.getDate(), 2) %> </td> \
                    <td style="text-align: right;"> <%= Opty.util.formatNumber(site.visitors, 0) %> </td> \
                    <td style="text-align: right;"> <%= Opty.util.formatNumber(site.keywords, 0) %> </td> \
                    <td style="text-align: right;"> <%= "$" + Opty.util.formatNumber(site.tcoTraffic, 0) %> </td> \
                    <td style="text-align: right;"> <%= "$" + Opty.util.formatNumber(site.tcoSEO, 0) %> </td> \
                    <td style="text-align: right;"> <%= "$" + Opty.util.formatNumber(site.tcoTotal, 0) %> </td> \
                </tr> \
            <% }); %> \
            </table> \
        ');
        
        this.$el.append(widget_template({
            sites: this.collection.models[0].get('organizations')
        }));

        return this.$el;
    }
});
