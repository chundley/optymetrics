var opty = opty || {};

opty.OperationsView = Backbone.View.extend({
    id: 'operations-view',
    className: 'row-fluid',

    initialize: function (options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render', 'tcoDataChanged');
        me.collection.on('reset', me.tcoDataChanged);
    },
    tcoDataChanged: function () {
        this.render();
    },
    render: function () {
        switch (this.options.selected) {
            default:
                {
                    var tco_collection = new opty.TCOCollection();

                    var tco_table = new opty.TableView({
                        table_fields: [
                          {
                              field: 'name',
                              display_name: 'Customer'
                          },
                          {
                              field: 'sku',
                              display_name: 'SKU'
                          },
                          {
                              field: 'tcoTotal',
                              display_name: 'Total TCO'
                          }
                        ],
                        collection: tco_collection
                    });

                    this.$el.append($('<div>', { 'class': 'span6' }).append(tco_table.$el));

                    tco_collection.fetch();
                    break;
                }
            case 'tco-metrics':
                {
                    break;
                }
        }


        return this.$el;
    }
});
