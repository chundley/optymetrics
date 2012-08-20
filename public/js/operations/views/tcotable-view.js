var opty = opty || {};

opty.TCOTableView = Backbone.View.extend({

    initialize: function (options) {
        var me = this;

        _.bindAll(me, 'render', 'tcoDataChanged');

        me.collection = options.collection;
        me.collection.on('reset', me.tcoDataChanged);
    },
    tcoDataChanged: function () {
        this.render();
    },
    render: function () {
        console.log('here');
        var me = this;
        this.$el.empty();

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
                              field: 'tcoTraffic',
                              display_name: 'Traffic TCO',
                              text_align: 'right',
                              formatter: function (data) {
                                  if (data) {
                                      return '$ ' + opty.util.formatNumber(data, 2);
                                  } else {
                                      return "";
                                  }
                              }
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
            collection: me.collection
        });

        this.$el.append($('<div>', { 'class': 'span9' }).append(tco_table.$el));
        return this.$el;
    }

});