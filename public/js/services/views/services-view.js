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

        var $outerRow = $('<div>', { 'class': 'row' });
        var $leftDiv = $('<div>', { 'class': 'span14' });
        var $rightDiv = $('<div>', { 'class': 'span4' });



        var $firstRowLeft = $('<div>', { 'class': 'row' });
        var $secondRowLeft = $('<div>', { 'class': 'row' });

        var $firstRowRight = $('<div>', { 'class': 'row' });


        var $sitesDiv = $('<div>', { 'class': 'span14' });
        var $usageDiv = $('<div>', { 'class': 'span14' });
        var $summaryDiv = $('<div>', { 'class': 'span4' });

        $firstRowLeft.append($sitesDiv);
        $secondRowLeft.append($usageDiv);

        $firstRowRight.append($summaryDiv);

        $leftDiv.append($firstRowLeft);
        $leftDiv.append($secondRowLeft);
        $rightDiv.append($firstRowRight);


        $outerRow.append($leftDiv);
        $outerRow.append($rightDiv);

        var customerCollection = new Opty.CustomerCollection({});
        var customerSummaryView = new Opty.CustomerSummaryView({collection: customerCollection});
        var customerSiteView = new Opty.CustomerSiteView({collection: customerCollection});
        $summaryDiv.append(customerSummaryView.$el);
        $sitesDiv.append(customerSiteView.$el);

        var usageCollection = new Opty.CustomerUsageCollection({startDate: Date.today().add({ days: -30 }), endDate: Date.today()});
        var usageSummaryView = new Opty.CustomerUsageView({collection: usageCollection});
        $usageDiv.append(usageSummaryView.$el);


        me.$el.append($outerRow);

        // if an id is present this was a hard-coded request for customer detail
        if (id) {
            Opty.pubsub.trigger('searchbox:changed', { id: id });
        }

    },
    renderSomething: function() {
        var me = this;
    }

});
