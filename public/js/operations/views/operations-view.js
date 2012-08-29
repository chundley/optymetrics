if (!window.Opty) { window.Opty = {}; }

Opty.OperationsView = Backbone.View.extend({
    id: 'operations-view',
    initialize: function (options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render');
    },
    render: function () {
        switch (this.options.selected) {
            case 'uptime':
                {
                    var me = this;
                    var numDays = 30;
                    // pre-render divs or the widgets will render in random order
                    // ROW 1
                    var $row1 = $('<div>', { 'class': 'row-fluid' });
                    var $divUptimeService = $('<div>', { 'class': 'span3' });
                    var $divUptimeDashboard = $('<div>', { 'class': 'span3' });
                    var $divUptimePages = $('<div>', { 'class': 'span3' });
                    var $divUptimeApi = $('<div>', { 'class': 'span3' });
                    me.$el.append($row1);
                    $row1.append($divUptimeService);
                    $row1.append($divUptimeDashboard);
                    $row1.append($divUptimePages);
                    $row1.append($divUptimeApi);

                    // ROW 2
                    var $row2 = $('<div>', { 'class': 'row-fluid' });

                    var endDate = Date.today();
                    var startDate = Date.today().add({ days: -numDays });

                    // fetch and render uptime widget for service.optify.net
                    var uptimeCollectionService = new Opty.UptimeCollection({}, { 'monitorName': 'service', 'startDate': startDate, 'endDate': endDate });
                    var uptimeWidgetService = new Opty.UptimeWidgetView({ collection: uptimeCollectionService, title: 'service uptime', goal: '99.99%', period: numDays + ' days' });
                    $divUptimeService.append(uptimeWidgetService.$el);
                    uptimeCollectionService.fetch();


                    // fetch and render uptime widget for dashboard.optify.net
                    var uptimeCollectionDashboard = new Opty.UptimeCollection({}, { 'monitorName': 'dashboardormaint', 'startDate': startDate, 'endDate': endDate });
                    var uptimeWidgetDashboard = new Opty.UptimeWidgetView({ collection: uptimeCollectionDashboard, title: 'dashboard uptime', goal: '99.99%', period: numDays + ' days' });
                    $divUptimeDashboard.append(uptimeWidgetDashboard.$el);
                    uptimeCollectionDashboard.fetch();

                    
                    // fetch and render uptime widget for pages.optify.net
                    var uptimeCollectionLandingPages = new Opty.UptimeCollection({}, { 'monitorName': 'landingpages', 'startDate': startDate, 'endDate': endDate });
                    var uptimeWidgetLandingPages = new Opty.UptimeWidgetView({ collection: uptimeCollectionLandingPages, title: 'landing pg uptime', goal: '99.99%', period: numDays + ' days' });
                    $divUptimePages.append(uptimeWidgetLandingPages.$el);
                    uptimeCollectionLandingPages.fetch();

                    // fetch and render uptime widget for api.optify.net
                    var uptimeCollectionApi = new Opty.UptimeCollection({}, { 'monitorName': 'api', 'startDate': startDate, 'endDate': endDate });
                    var uptimeWidgetApi = new Opty.UptimeWidgetView({ collection: uptimeCollectionApi, title: 'api uptime', goal: '99.99%', period: numDays + ' days' });
                    $divUptimeApi.append(uptimeWidgetApi.$el);
                    uptimeCollectionApi.fetch();
                    
                    break;
                }
            case 'tco':
                {

                    var tco_collection = new Opty.TCOCollection({}, { 'count': '100' });

                    var tco_table = new Opty.TableView({
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
                                return Opty.util.formatNumber(data, 0);
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
                                return '$' + Opty.util.formatNumber(data, 2);
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
                                return Opty.util.formatNumber(data, 0);
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
                                return '$' + Opty.util.formatNumber(data, 2);
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
                                return '$' + Opty.util.formatNumber(data, 2);
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
                                return '$' + Opty.util.formatNumber(data, 2);
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
                                    return '($' + Opty.util.formatNumber(data, 2).replace(/-/, '') + ')';
                                }
                                else {
                                    return '$' + Opty.util.formatNumber(data, 2);
                                }
                            } else {
                                return '$0.00';
                            }
                        }
                    }
                    ],

                        sortable: true,
                        defaultSort: [[6, 1]],
                        sortInitialOrder: 'desc',
                        collection: tco_collection
                    });

                    this.$el.append($('<div>', { 'class': 'span12' }).append(tco_table.$el));

                    tco_collection.fetch();


                    /*
                    var tco_collection = new Opty.TCOCollection();


                    var tcotable_view = new Opty.TCOTableView({ collection: tco_collection });
                    this.$el.append(tcotable_view.$el);
                    tco_collection.fetch();
                    */
                    break;
                }
            default:
                {

                    this.$el.append('Coming soon!');
                    break;
                }
        }


        return this.$el;
    }
});
