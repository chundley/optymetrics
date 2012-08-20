var opty = opty || {};

opty.OperationsView = Backbone.View.extend({
    id: 'operations-view',
    className: 'row-fluid',

    initialize: function (options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render');
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
                        field: 'pageviews',
                        display_name: 'Page views',
                        text_align: 'right',
                        formatter: function (data) {
                            if (data) {
                                return opty.util.formatNumber(data, 0);
                            } else {
                                return '0';
                            }
                        }
                    },
                    {
                        field: 'tcoTraffic',
                        display_name: 'Traffic TCO',
                        text_align: 'right',
                        formatter: function (data) {
                            if (data) {
                                return '$' + opty.util.formatNumber(data, 2);
                            } else {
                                return '$0.00';
                            }
                        }
                    },
                    {
                        field: 'keywords',
                        display_name: 'Keywords',
                        text_align: 'right',
                        formatter: function (data) {
                            if (data) {
                                return opty.util.formatNumber(data, 0);
                            } else {
                                return '0';
                            }
                        }
                    },
                    {
                        field: 'tcoSEO',
                        display_name: 'Keyword TCO',
                        text_align: 'right',
                        formatter: function (data) {
                            if (data) {
                                return '$' + opty.util.formatNumber(data, 2);
                            } else {
                                return '$0.00';
                            }
                        }
                    },
                    {
                        field: 'tcoTotal',
                        display_name: 'Total TCO',
                        text_align: 'right',
                        formatter: function (data) {
                            if (data) {
                                return '$' + opty.util.formatNumber(data, 2);
                            } else {
                                return '$0.00';
                            }
                        }
                    }
                    ],
                        collection: tco_collection
                    });

                    this.$el.append($('<div>', { 'class': 'span9' }).append(tco_table.$el));

                    tco_collection.fetch();


                    /*
                    var tco_collection = new opty.TCOCollection();


                    var tcotable_view = new opty.TCOTableView({ collection: tco_collection });
                    this.$el.append(tcotable_view.$el);
                    tco_collection.fetch();
                    */
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
