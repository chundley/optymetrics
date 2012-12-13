if(!window.Opty) { window.Opty = {}; }

Opty.ServicesView = Backbone.View.extend({
    id: 'services-view',

    initialize: function (options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render', 'renderResearch');
    },

    render: function () {
        switch (this.options.selected) {
            case 'support':
                {
                    // todo
                    break;
                }
            case 'research':
            default:
                {
                    this.renderResearch(this.options.id);
                    break;
                }
        }
        return this.$el;
    },

    renderResearch: function (id) {
        var me = this;

        // Unbind all searchbox:changed listeners. TODO: More robust view cleanup
        Opty.pubsub.unbind('searchbox:changed');

        // Configure search box
        var $customerSearchRow = $('<div>', { 'class': 'row' });
        $customerSearchRow.append('<div class="span1" style="font-size: 16px; color: #dddddd; padding-top: 5px;">Customer</div>');

        var customerSearchCollection = new Opty.CustomerSearchCollection({query: ''});
        customerSearchCollection.fetch();
        var customerSearchView = new Opty.SearchBoxView({collection: customerSearchCollection});

        $customerSearchRow.append(customerSearchView.$el);
        me.$el.append($customerSearchRow);
        // end search box config

        var $firstRow = $('<div>', { 'class': 'row' });
        var $sitesDiv = $('<div>', { 'class': 'span12' });
        var $summaryDiv = $('<div>', { 'class': 'span4' });
        var customerCollection = new Opty.CustomerCollection({});
        var customerSummaryView = new Opty.CustomerSummaryView({collection: customerCollection});
        var customerSiteView = new Opty.CustomerSiteView({collection: customerCollection});
        $summaryDiv.append(customerSummaryView.$el);
        $sitesDiv.append(customerSiteView.$el);

        $firstRow.append($sitesDiv);
        $firstRow.append($summaryDiv);
        me.$el.append($firstRow);

        if (id) {
            // TEST TEST.  Can we trigger this here so the rest of the views refresh?  Need to fill in the searchbox as well
            me.$el.append('Link case');
            Opty.pubsub.trigger('searchbox:changed', { id: id });
        }

    },
    renderSomething: function() {
        var me = this;
    }

});
