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
            default: // 'uptime'
                {
                    var me = this;

                    // Unbind all reportrange:changed listeners. TODO: More robust view cleanup
                    Opty.pubsub.unbind('reportrange:changed');

                    // Configure report date range picker
                    var $datePickerRow = $('<div>', { 'class': 'row-fluid' });
                    var datePickerView = new Opty.DateRangeView({ defaultDays: 30 });

                    $datePickerRow.append(datePickerView.$el);
                    me.$el.append($datePickerRow);

                    // pre-render divs or the widgets will render in random order
                    // ROW 1
                    var $row1 = $('<div>', { 'class': 'row-fluid' });
                    var $divUptimeServiceAggregate = $('<div>', { 'class': 'span3' });
                    var $divUptimeDashboardAggregate = $('<div>', { 'class': 'span3' });
                    var $divUptimePagesAggregate = $('<div>', { 'class': 'span3' });
                    var $divUptimeApiAggregate = $('<div>', { 'class': 'span3' });
                    me.$el.append($row1);
                    $row1.append($divUptimeServiceAggregate);
                    $row1.append($divUptimeDashboardAggregate);
                    $row1.append($divUptimePagesAggregate);
                    $row1.append($divUptimeApiAggregate);

                    // ROW 2
                    var $row2 = $('<div>', { 'class': 'row-fluid' });
                    var $divUptimeService = $('<div>', { 'class': 'span3', 'style': 'padding-top: 10px;' });
                    var $divUptimeDashboard = $('<div>', { 'class': 'span3', 'style': 'padding-top: 10px;' });
                    var $divUptimePages = $('<div>', { 'class': 'span3', 'style': 'padding-top: 10px;' });
                    var $divUptimeApi = $('<div>', { 'class': 'span3', 'style': 'padding-top: 10px;' });
                    me.$el.append($row2);
                    $row2.append($divUptimeService);
                    $row2.append($divUptimeDashboard);
                    $row2.append($divUptimePages);
                    $row2.append($divUptimeApi);

                    // fetch and render uptime widget for service.optify.net
                    var uptimeCollectionService = new Opty.UptimeAggregateCollection({ 'monitorName': 'service' });
                    var uptimeWidgetService = new Opty.UptimeAggregateWidgetView({ collection: uptimeCollectionService, title: 'service uptime', goal: '99.99%' });
                    $divUptimeServiceAggregate.append(uptimeWidgetService.$el);

                    // fetch and render uptime widget for dashboard.optify.net
                    var uptimeCollectionDashboard = new Opty.UptimeAggregateCollection({ 'monitorName': 'dashboardormaint' });
                    var uptimeWidgetDashboard = new Opty.UptimeAggregateWidgetView({ collection: uptimeCollectionDashboard, title: 'dashboard uptime', goal: '99.99%' });
                    $divUptimeDashboardAggregate.append(uptimeWidgetDashboard.$el);


                    // fetch and render uptime widget for pages.optify.net
                    var uptimeCollectionLandingPages = new Opty.UptimeAggregateCollection({ 'monitorName': 'landingpages' });
                    var uptimeWidgetLandingPages = new Opty.UptimeAggregateWidgetView({ collection: uptimeCollectionLandingPages, title: 'landing pages uptime', goal: '99.99%' });
                    $divUptimePagesAggregate.append(uptimeWidgetLandingPages.$el);

                    // fetch and render uptime widget for api.optify.net
                    var uptimeCollectionApi = new Opty.UptimeAggregateCollection({ 'monitorName': 'api' });
                    var uptimeWidgetApi = new Opty.UptimeAggregateWidgetView({ collection: uptimeCollectionApi, title: 'api uptime', goal: '99.99%' });
                    $divUptimeApiAggregate.append(uptimeWidgetApi.$el);

                    // fetch and render uptime trend widget for service.optify.net
                    var uptimeCollectionService2 = new Opty.UptimeCollection({ 'monitorName': 'service' });
                    var uptimeWidgetService2 = new Opty.UptimeWidgetView({ collection: uptimeCollectionService2, title: 'service - daily status' });
                    $divUptimeService.append(uptimeWidgetService2.$el);

                    // fetch and render uptime trend widget for dashboard.optify.net
                    var uptimeCollectionDashboard2 = new Opty.UptimeCollection({ 'monitorName': 'dashboardormaint' });
                    var uptimeWidgetDashboard2 = new Opty.UptimeWidgetView({ collection: uptimeCollectionDashboard2, title: 'dashboard - daily status' });
                    $divUptimeDashboard.append(uptimeWidgetDashboard2.$el);

                    // fetch and render uptime trend widget for pages.optify.net
                    var uptimeCollectionPages2 = new Opty.UptimeCollection({ 'monitorName': 'landingpages' });
                    var uptimeWidgetPages2 = new Opty.UptimeWidgetView({ collection: uptimeCollectionPages2, title: 'landing pages - daily status' });
                    $divUptimePages.append(uptimeWidgetPages2.$el);

                    // fetch and render uptime trend widget for api.optify.net
                    var uptimeCollectionApi2 = new Opty.UptimeCollection({ 'monitorName': 'api' });
                    var uptimeWidgetApi2 = new Opty.UptimeWidgetView({ collection: uptimeCollectionApi2, title: 'api - daily status' });
                    $divUptimeApi.append(uptimeWidgetApi2.$el);

                    datePickerView.render();
                    break;
                }
            case 'incidents': {
                var me = this;
                // Unbind all reportrange:changed listeners. TODO: More robust view cleanup
                Opty.pubsub.unbind('reportrange:changed');

                // Configure report date range picker
                var $datePickerRow = $('<div>', { 'class': 'row-fluid' });
                var datePickerView = new Opty.DateRangeView({ defaultDays: 30 });

                $datePickerRow.append(datePickerView.$el);
                me.$el.append($datePickerRow);

                var $chartRow = $('<div>', { 'class': 'row-fluid' });
                var $chartColumn = $('<div>', { 'class': 'span12' });
                me.$el.append($chartRow);
                $chartRow.append($chartColumn);

                var $controlsRow = $('<div>', { 'class': 'row-fluid incident-view-controls' });
                $controlsRow.append($('<a>', { 'class': 'btn btn-primary', 'href': '/ops/incident', 'text': 'Add Incident' }));
                me.$el.append($controlsRow);

                var incidentAggregates= new Opty.IncidentsAggregateCollection({});
                var incidentsChartView = new Opty.IncidentsChartView({ collection: incidentAggregates });
                
                $chartColumn.append(incidentsChartView.$el);


                var $tableRow = $('<div>', { 'class': 'row-fluid report-section' });
                var $tableColumn = $('<div>', { 'class': 'span12' });
                $tableRow.append($tableColumn);
                me.$el.append($tableRow);
                
                var incidentsCollection = new Opty.IncidentsCollection({});

                var incidentsTable  = new Opty.TableView({
                    table_fields: [
                        {
                            field: 'createdOn',
                            display_name: 'Date',
                            formatter: 'date'
                        },
                        {
                            field: 'status',
                            display_name: 'Status'
                        },
                        {
                            field: 'subject',
                            display_name: 'Summary'
                        },
                        {
                            field: 'notes',
                            display_name: 'Notes'
                        },
                        {
                            field: 'source',
                            display_name: 'Source'
                        },
                        {
                            field: 'lastUpdatedOn',
                            display_name: 'Last Updated',
                            formatter: 'date' 
                        },
                        {
                            field: 'lastUpdatedBy',
                            display_name: 'Updated By'
                        },
                        {
                            field: 'incidentNumber',
                            display_name: 'Actions',
                            formatter: function(data) {
                                return '<form method="POST" action="/ops/incident/hide/' + data + '"><button type="submit" class="btn btn-small">Hide</button></form>' +
                                       '<a href="/ops/incident/edit/' + data + '" class="btn btn-small">Edit</a>'; 
                            }
                        }
                    ],

                    cssClass: 'incidentsTable', 
                    sortable: true,
                    defaultSort: [[0, 1]],
                    sortInitialOrder: 'desc',
                    collection: incidentsCollection 
                });
                
                $tableColumn.append(incidentsTable.$el); 
                
                datePickerView.render();

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
                    var $reportRow = $('<div>', { 'class': 'row-fluid' });
                    $reportRow.append($('<div>', { 'class': 'span12' }).append(tco_table.$el));
                    this.$el.append($reportRow);

                    tco_collection.fetch();


                    /*
                    var tco_collection = new Opty.TCOCollection();


                    var tcotable_view = new Opty.TCOTableView({ collection: tco_collection });
                    this.$el.append(tcotable_view.$el);
                    tco_collection.fetch();
                    */
                    break;
                }
            case 'vendor':
                {
                    var me = this;

                    // Unbind all reportrange:changed listeners. TODO: More robust view cleanup
                    Opty.pubsub.unbind('reportrange:changed');

                    // Configure report date range picker
                    var $datePickerRow = $('<div>', { 'class': 'row-fluid' });
                    var datePickerView = new Opty.DateRangeView({ defaultDays: 365 + 30 });

                    $datePickerRow.append(datePickerView.$el);
                    me.$el.append($datePickerRow);

                    var vendorCostCollection = new Opty.VendorCostCollection({});

                    var $row1 = $('<div>', { 'class': 'row-fluid' });
                    var $row2 = $('<div>', { 'class': 'row-fluid', 'style': 'padding-top: 8px;' });
                    var $divOperationsCostChart = $('<div>', { 'class': 'span6' });
                    var $divCategoryCostChart = $('<div>', { 'class': 'span6' });
                    var $divVendorCostChart = $('<div>', { 'class': 'span6' });

                    me.$el.append($row1);
                    me.$el.append($row2);

                    $row1.append($divOperationsCostChart);
                    $row1.append($divCategoryCostChart);

                    $row2.append($divVendorCostChart);

                    var chartWidgetView = new Opty.ChartWidgetView({ chart: new Opty.OperationsCostChart({ collection: vendorCostCollection }) });
                    $divOperationsCostChart.append(chartWidgetView.$el);

                    var chartWidgetView2 = new Opty.ChartWidgetView({ chart: new Opty.CategoryCostChart({ collection: vendorCostCollection }) });
                    $divCategoryCostChart.append(chartWidgetView2.$el);

                    var chartWidgetView3 = new Opty.ChartWidgetView({ chart: new Opty.VendorCostChart({ collection: vendorCostCollection }) });
                    $divVendorCostChart.append(chartWidgetView3.$el);

                    datePickerView.render();
                    break;
                }
        }


        return this.$el;
    }
});
