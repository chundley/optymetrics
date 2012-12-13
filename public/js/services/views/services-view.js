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
        $customerSearchRow.append('<div class="span2" style="font-size: 16px; color: #dddddd; padding-top: 4px;">Customer Search</div>');

        var customerSearchCollection = new Opty.CustomerSearchCollection({query: ''});
        customerSearchCollection.fetch();
        var customerSearchView = new Opty.SearchBoxView({collection: customerSearchCollection});

        $customerSearchRow.append(customerSearchView.$el);
        me.$el.append($customerSearchRow);
        // end search box config


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
