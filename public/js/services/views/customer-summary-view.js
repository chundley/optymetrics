if (!window.Opty) { window.Opty = {}; }

Opty.CustomerSummaryView = Backbone.View.extend({
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
             <tr> \
                <td colspan="2"style="font-weight: bold; text-align: center; background: #343434; color: #eeeeee"><%= customerName %></td> \
            </tr> \
            <tr> \
                <td>Optify customer ID</td> \
                <td style="text-align: center"><%= customerId %></td> \
            </tr> \
            <tr> \
                <td>Salesforce name</td> \
                <td style="text-align: center"><%= salesForceName %></td> \
            </tr> \
            <tr> \
                <td>Date created</td> \
                <td style="text-align: center"><%= dateCreated %></td> \
            </tr> \
            <tr> \
                <td>SKU</td> \
                <td style="text-align: center"><%= sku %></td> \
            </tr> \
            <tr> \
                <td>Total sites</td> \
                <td style="text-align: center"><%= totalSites %></td> \
            </tr> \
            <tr> \
                <td>Active sites</td> \
                <td style="text-align: center"><%= activeSites %></td> \
            </tr> \
            <tr> \
                <td>MRR</td> \
                <td style="text-align: center"><%= mrr %></td> \
            </tr> \
            <tr> \
                <td>COGS</td> \
                <td style="text-align: center"><%= cogs %></td> \
            </tr> \
            <tr> \
                <td>Net revenue</td> \
                <td style="text-align: center"><%= net %></td> \
            </tr> \
            <tr> \
                <td>Margin</td> \
                <td style="text-align: center"><%= margin %></td> \
            </tr> \
            </table> \
        ');
        
        // set up some of the data
        var createdAt = new Date(this.collection.models[0].get('createdAt'));

        var activeSites = 0, inactiveSites = 0;
        _.each(this.collection.models[0].get('organizations'), function(org) {
            if (org.disabled) {
                inactiveSites++;
            }
            else {
                activeSites++;
            }
        });
        
        var netRevenue = this.collection.models[0].get('mrr') - this.collection.models[0].get('tcoTotal');
        var margin = (this.collection.models[0].get('mrr') - this.collection.models[0].get('tcoTotal')) / (this.collection.models[0].get('mrr'));

        this.$el.append(widget_template({
            customerName: this.collection.models[0].get('name'),
            customerId: this.collection.models[0].get('id'),
            salesForceName: this.collection.models[0].get('salesforceName'),
            dateCreated: createdAt.getFullYear() + '-' + Opty.util.padNumber(createdAt.getMonth() + 1, 2) + '-' + Opty.util.padNumber(createdAt.getDate(), 2),
            sku: this.collection.models[0].get('sku'),
            totalSites: inactiveSites + activeSites,
            activeSites: activeSites,
            mrr: '$' + Opty.util.formatNumber(this.collection.models[0].get('mrr'), 0),
            cogs: '$' + Opty.util.formatNumber(this.collection.models[0].get('tcoTotal'), 0),
            net: (netRevenue >= 0) ? '$' + Opty.util.formatNumber(netRevenue, 0) : '$(' + Opty.util.formatNumber(netRevenue, 0) + ')',
            margin: Opty.util.formatNumber(margin*100, 2) + '%'
        }));

        return this.$el;
    }
});
