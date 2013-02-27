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
                    var $datePickerRow = $('<div>', { 'class': 'row' });
                    var datePickerView = new Opty.DateRangeView({ defaultDays: 30 });

                    $datePickerRow.append(datePickerView.$el);
                    me.$el.append($datePickerRow);

                    // overall system uptime
                    var $overallrowheader = $('<div class="row"><div class="span9"><div class="widget-group-header-container"><div class="widget-group-header"><span>Entire System</span></div></div></div></div>');
                    var $overallrow = $('<div>', { 'class': 'row' });

                    var uptimeCollectionSystem = new Opty.UptimeAggregateCollection({ });
                    var $overallCurrentPeriodWidget = new Opty.UptimeAggregateWidgetView({collection: uptimeCollectionSystem, cssClass: 'span3', header: 'This Period', footer: 'Uptime', current: true});
                    var $overallPreviousPeriodWidget = new Opty.UptimeAggregateWidgetView({collection: uptimeCollectionSystem, cssClass: 'span3', header: 'Previous Period', footer: 'Uptime', current: false});
                    $overallrow.append($overallCurrentPeriodWidget.$el);
                    $overallrow.append($overallPreviousPeriodWidget.$el);

                    var uptimeCollectionSystemDetail = new Opty.UptimeCollection({ });
                    var $uptimeWidgetSystemTrend = new Opty.UptimeWidgetView({ collection: uptimeCollectionSystemDetail, cssClass: 'span3', header: 'Daily Detail' });
                    $overallrow.append($uptimeWidgetSystemTrend.$el);

                    // dashboard uptime
                    var $dashboardrowheader = $('<div class="row" style="padding-top: 20px;"><div class="span9"><div class="widget-group-header-container"><div class="widget-group-header"><span>dashboard.optify.net</span></div></div></div></div>');
                    var $dashboardrow = $('<div>', { 'class': 'row' });

                    var uptimeCollectionDashboard = new Opty.UptimeAggregateCollection({ 'monitorName': 'dashboardormaint' });
                    var $dashboardCurrentPeriodWidget = new Opty.UptimeAggregateWidgetView({collection: uptimeCollectionDashboard, cssClass: 'span3', header: 'This Period', footer: 'Uptime', current: true});
                    var $dashboardPreviousPeriodWidget = new Opty.UptimeAggregateWidgetView({collection: uptimeCollectionDashboard, cssClass: 'span3', header: 'Previous Period', footer: 'Uptime', current: false});
                    $dashboardrow.append($dashboardCurrentPeriodWidget.$el);
                    $dashboardrow.append($dashboardPreviousPeriodWidget.$el);

                    var uptimeCollectionDashboardDetail = new Opty.UptimeCollection({ 'monitorName': 'dashboardormaint' });
                    var $uptimeWidgetDashboardTrend = new Opty.UptimeWidgetView({ collection: uptimeCollectionDashboardDetail, cssClass: 'span3', header: 'Daily Detail' });
                    $dashboardrow.append($uptimeWidgetDashboardTrend.$el);

                    // service uptime
                    var $servicerowheader = $('<div class="row"><div class="span9" style="padding-top: 20px;"><div class="widget-group-header-container"><div class="widget-group-header"><span>service.optify.net</span></div></div></div></div>');
                    var $servicerow = $('<div>', { 'class': 'row' });

                    var uptimeCollectionService = new Opty.UptimeAggregateCollection({ 'monitorName': 'service' });
                    var $serviceCurrentPeriodWidget = new Opty.UptimeAggregateWidgetView({collection: uptimeCollectionService, cssClass: 'span3', header: 'This Period', footer: 'Uptime', current: true});
                    var $servicePreviousPeriodWidget = new Opty.UptimeAggregateWidgetView({collection: uptimeCollectionService, cssClass: 'span3', header: 'Previous Period', footer: 'Uptime', current: false});
                    $servicerow.append($serviceCurrentPeriodWidget.$el);
                    $servicerow.append($servicePreviousPeriodWidget.$el);

                    var uptimeCollectionServiceDetail = new Opty.UptimeCollection({ 'monitorName': 'service' });
                    var $uptimeWidgetServiceTrend = new Opty.UptimeWidgetView({ collection: uptimeCollectionServiceDetail, cssClass: 'span3', header: 'Daily Detail' });
                    $servicerow.append($uptimeWidgetServiceTrend.$el);

                    // pages uptime
                    var $pagesrowheader = $('<div class="row"><div class="span9" style="padding-top: 20px;"><div class="widget-group-header-container"><div class="widget-group-header"><span>pages.optify.net</span></div></div></div></div>');
                    var $pagesrow = $('<div>', { 'class': 'row' });

                    var uptimeCollectionPages = new Opty.UptimeAggregateCollection({ 'monitorName': 'landingpages' });
                    var $pagesCurrentPeriodWidget = new Opty.UptimeAggregateWidgetView({collection: uptimeCollectionPages, cssClass: 'span3', header: 'This Period', footer: 'Uptime', current: true});
                    var $pagesPreviousPeriodWidget = new Opty.UptimeAggregateWidgetView({collection: uptimeCollectionPages, cssClass: 'span3', header: 'Previous Period', footer: 'Uptime', current: false});
                    $pagesrow.append($pagesCurrentPeriodWidget.$el);
                    $pagesrow.append($pagesPreviousPeriodWidget.$el);

                    var uptimeCollectionPagesDetail = new Opty.UptimeCollection({ 'monitorName': 'landingpages' });
                    var $uptimeWidgetPagesTrend = new Opty.UptimeWidgetView({ collection: uptimeCollectionPagesDetail, cssClass: 'span3', header: 'Daily Detail' });
                    $pagesrow.append($uptimeWidgetPagesTrend.$el);

                    // api uptime
                    var $apirowheader = $('<div class="row"><div class="span9" style="padding-top: 20px;"><div class="widget-group-header-container"><div class="widget-group-header"><span>api.optify.net</span></div></div></div></div>');
                    var $apirow = $('<div>', { 'class': 'row' });

                    var uptimeCollectionApi = new Opty.UptimeAggregateCollection({ 'monitorName': 'api' });
                    var $apiCurrentPeriodWidget = new Opty.UptimeAggregateWidgetView({collection: uptimeCollectionApi, cssClass: 'span3', header: 'This Period', footer: 'Uptime', current: true});
                    var $apiPreviousPeriodWidget = new Opty.UptimeAggregateWidgetView({collection: uptimeCollectionApi, cssClass: 'span3', header: 'Previous Period', footer: 'Uptime', current: false});
                    $apirow.append($apiCurrentPeriodWidget.$el);
                    $apirow.append($apiPreviousPeriodWidget.$el);

                    var uptimeCollectionApiDetail = new Opty.UptimeCollection({ 'monitorName': 'api' });
                    var $uptimeWidgetApiTrend = new Opty.UptimeWidgetView({ collection: uptimeCollectionApiDetail, cssClass: 'span3', header: 'Daily Detail' });
                    $apirow.append($uptimeWidgetApiTrend.$el);

                    me.$el.append($overallrowheader);
                    me.$el.append($overallrow);

                    me.$el.append($dashboardrowheader);
                    me.$el.append($dashboardrow);

                    me.$el.append($servicerowheader);
                    me.$el.append($servicerow);

                    me.$el.append($pagesrowheader);
                    me.$el.append($pagesrow);

                    me.$el.append($apirowheader);
                    me.$el.append($apirow);

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

                    var tco_collection = new Opty.TCOCollection({}, { 'count': '500' });

                    var tco_table = new Opty.TableView({
                        table_fields: [
                        {
                            field: 'name',
                            display_name: 'Customer',
                            formatter: function(data, id) {
                                return '<a href="/#services/research/' + id + '">' + data + '</a>';
                            }
                        },
                        {
                            field: 'sku',
                            display_name: 'SKU'
                        },
                        {
                            field: 'bigScore',
                            display_name: 'TBS'
                        },
                        {
                            field: 'createdAt',
                            display_name: 'Created',
                            formatter: 'date'
                        },
                        {
                            field: 'sites',
                            display_name: 'Sites'
                        },
                        {
                            field: 'pageviews',
                            display_name: 'Page Views',
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
                            field: 'visitors',
                            display_name: 'Visitors',
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
                            field: 'mrrServices',
                            display_name: 'Services MRR',
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
                        defaultSort: [[10, 1]],
                        sortInitialOrder: 'desc',
                        collection: tco_collection
                    });
                    var $reportRow = $('<div>', { 'class': 'row-fluid' });
                    $reportRow.append($('<div>', { 'class': 'span12' }).append(tco_table.$el));
                    this.$el.append($reportRow);

                    tco_collection.fetch();
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

                    var chartWidgetView = new Opty.OperationsCostChart({ collection: vendorCostCollection });
                    $divOperationsCostChart.append(chartWidgetView.$el);

                    var chartWidgetView2 = new Opty.CategoryCostChart({ collection: vendorCostCollection });
                    $divCategoryCostChart.append(chartWidgetView2.$el);

                    var chartWidgetView3 = new Opty.VendorCostChart({ collection: vendorCostCollection });
                    $divVendorCostChart.append(chartWidgetView3.$el);

                    datePickerView.render();
                    break;
                }
        }


        return this.$el;
    }
});
