var opty = opty || {};

opty.OperationsView = Backbone.View.extend({
    id: 'operations-view',
    className: 'row-fluid',

    initialize: function (options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render');
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
                              display_name: 'Total TCO',
                              text_align: 'right',
                              formatter: function (data) {
                                  if (data) {
                                      return '$ ' + opty.util.formatNumber(data, 2);
                                  } else {
                                      return "";
                                  }
                              }
                          }
                        ],
                        collection: tco_collection
                    });

                    this.$el.append($('<div>', { 'class': 'span9' }).append(tco_table.$el));

                    tco_collection.fetch();

                    break;
                }
            case 'tco-metrics':
                {
                    this.$el.append($('<div>TCO Metrics sub page</div>'));
                    break;
                }
        }


        return this.$el;
    }
});
