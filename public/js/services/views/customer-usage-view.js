if (!window.Opty) { window.Opty = {}; }

Opty.CustomerUsageView = Backbone.View.extend({
    initialize: function (options) {
        var me = this;
        _.bindAll(me, 'render');
        me.collection = options.collection;
        me.collection.on('reset', this.render);
    },
    events : {
        'click #usagetableheader' : 'toggleUsageTable'
    },
    toggleUsageTable: function(e) {
        var theDiv = this.$el.find('#usagetablecontainer');
        if (theDiv.is(':visible')) {
            theDiv.removeClass('show');
            theDiv.addClass('hide');
        }
        else {
            theDiv.removeClass('hide');
            theDiv.addClass('show');
        }
    },
    render: function () {
        var me = this;
        this.$el.empty();

        var usage_table = new Opty.TableView({
            table_fields: [
                {
                    field: 'app',
                    display_name: 'App'
                },
                {
                    field: 'eventApp',
                    display_name: 'Event'
                },
                {
                    field: 'eventName',
                    display_name: 'Event detail'
                },
                {
                    field: 'count',
                    display_name: 'Times used'
                }              
            ],
            sortable: true,
            defaultSort: [[3, 1]],            
            collection: me.collection
        });

        var $divTitle = $('<div class="widget-group-header-container" id="usagetableheader"><div class="widget-group-header"><span>App usage last 30 days</span></div></div>');
        var $divTableContainer = $('<div id="usagetablecontainer"></div>');
        $divTableContainer.append(usage_table.$el);
        this.$el.append($divTitle);
        this.$el.append($divTableContainer);
        usage_table.render();
        return this.$el;
    }
});
