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
            case 'uptime':
                {
                    var uptime_collection = new opty.UptimeCollection({}, { 'monitorName': 'dashboard', 'count': '30' });
                    var uptime_table = new opty.TableView({
                        table_fields: [
                    {
                        field: 'monitorDate',
                        display_name: 'Date',
                        formatter: function (data) {
                            if (data) {
                                var date = new Date(data);
                                return date.getFullYear() + '-' + opty.util.padNumber(date.getMonth() + 1, 2) + '-' + opty.util.padNumber(date.getDate(), 2);
                            } else {
                                return "";
                            }
                        }

                    },
                    {
                        field: 'uptime',
                        display_name: 'Uptime (m)',
                        text_align: 'right',
                        formatter: function (data) {
                            if (data) {
                                return opty.util.formatNumber(data / 60, 0);
                            } else {
                                return '0';
                            }
                        }

                    },
                    {
                        field: 'downtime',
                        display_name: 'Downtime (m)',
                        text_align: 'right',
                        formatter: function (data) {
                            if (data) {
                                return opty.util.formatNumber(data / 60, 0);
                            } else {
                                return '0';
                            }
                        }
                    }
                    ],
                        collection: uptime_collection

                    });
                    this.$el.append($('<div>', { 'class': 'span3' }).append(uptime_table.$el));

                    uptime_collection.fetch();

                    break;
                }
            case 'tco':
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
                    },
                    {
                        field: 'mrr',
                        display_name: 'Software MRR',
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
                        field: 'netRevenue',
                        display_name: 'Net Revenue',
                        text_align: 'right',
                        formatter: function (data) {
                            if (data) {
                                if (data < 0) {
                                    return '($' + opty.util.formatNumber(data, 2).replace(/-/, '') + ')';
                                }
                                else {
                                    return '$' + opty.util.formatNumber(data, 2);
                                }
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
            default:
                {
                    var widget_table = new opty.PeriodCompareWidgetView();
                    this.$el.append($('<div>', { 'class': 'span4' }).append(widget_table.$el));
                    console.log(this.$el);
                    break;
                }
        }


        return this.$el;
    }
});
