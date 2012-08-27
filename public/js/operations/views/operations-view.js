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
                    var that = this;

                    // pre-render divs or the widgets will render in random order
                    var $row1 = $('<div>', { 'class': 'row-fluid' });
                    var $divservice = $('<div>', { 'class': 'span3' });
                    var $divdashboard = $('<div>', { 'class': 'span3' });
                    var $divpages = $('<div>', { 'class': 'span3' });
                    var $divapi = $('<div>', { 'class': 'span3' });

                    var $row2 = $('<div>', { 'class': 'row-fluid' });
                    that.$el.append($row1);
                    $row1.append($divservice);
                    $row1.append($divdashboard);
                    $row1.append($divpages);
                    $row1.append($divapi);

                    /*
                    var uptime_collection = new Opty.UptimeCollection({}, { 'monitorName': 'dashboardormaint', 'count': '60' });
                    var uptime_view = new Opty.UptimeWidgetView({ collection: uptime_collection, title: 'dashboard uptime', goal: '99.99%', period: '30 days' });
                    */

                    // uptime widget for dashboard.optify.net
                    var uptime_collection = new Opty.UptimeCollection({}, { 'monitorName': 'dashboardormaint', 'count': '60' });
                    uptime_collection.fetch({
                        success: function (uptimes) {
                            var currentPerc = 0;
                            var oldPerc = 0;
                            var uTotal = 0, dTotal = 0;
                            var count = 1;
                            uptimes.forEach(function (u) {
                                uTotal += u.get('uptime');
                                dTotal += u.get('downtime');
                                count++;
                                if (count == 30) {
                                    currentPerc = uTotal / (uTotal + dTotal) * 100;
                                    uTotal = 0;
                                    dTotal = 0;
                                }
                            });

                            // account for the case where there are less than 30 data points
                            if (currentPerc > 0) {
                                oldPerc = uTotal / (uTotal + dTotal) * 100;
                            }
                            else {
                                currentPerc = uTotal / (uTotal + dTotal) * 100;
                                oldPerc = currentPerc;
                            }
                            var updown = (oldPerc == currentPerc) ? 'neutral' : (oldPerc < currentPerc) ? 'up' : 'down';
                            var widget_table = new Opty.PeriodCompareWidgetView({
                                title: 'dashboard uptime',
                                goal: '99.99%',
                                actual: Opty.util.formatNumber(currentPerc, 3) + '%',
                                type: updown,
                                delta: Opty.util.formatNumber(Math.abs(oldPerc - currentPerc), 3) + '%',
                                period: '30 days'
                            });
                            $divdashboard.append(widget_table.$el);
                        }

                    });

                    uptime_collection = new Opty.UptimeCollection({}, { 'monitorName': 'service', 'count': '60' });
                    uptime_collection.fetch({
                        success: function (uptimes) {
                            var currentPerc = 0;
                            var oldPerc = 0;
                            var uTotal = 0, dTotal = 0;
                            var count = 1;
                            uptimes.forEach(function (u) {
                                uTotal += u.get('uptime');
                                dTotal += u.get('downtime');
                                count++;
                                if (count == 30) {
                                    currentPerc = uTotal / (uTotal + dTotal) * 100;
                                    uTotal = 0;
                                    dTotal = 0;
                                }
                            });

                            // account for the case where there are less than 30 data points
                            if (currentPerc > 0) {
                                oldPerc = uTotal / (uTotal + dTotal) * 100;
                            }
                            else {
                                currentPerc = uTotal / (uTotal + dTotal) * 100;
                                oldPerc = currentPerc;
                            }
                            var updown = (oldPerc == currentPerc) ? 'neutral' : (oldPerc < currentPerc) ? 'up' : 'down';
                            var widget_table = new Opty.PeriodCompareWidgetView({
                                title: 'service uptime',
                                goal: '99.99%',
                                actual: Opty.util.formatNumber(currentPerc, 3) + '%',
                                type: updown,
                                delta: Opty.util.formatNumber(Math.abs(oldPerc - currentPerc), 3) + '%',
                                period: '30 days'
                            });

                            $divservice.append(widget_table.$el);
                        }

                    });

                    uptime_collection = new Opty.UptimeCollection({}, { 'monitorName': 'landingpages', 'count': '60' });
                    uptime_collection.fetch({
                        success: function (uptimes) {
                            var currentPerc = 0;
                            var oldPerc = 0;
                            var uTotal = 0, dTotal = 0;
                            var count = 1;
                            uptimes.forEach(function (u) {
                                uTotal += u.get('uptime');
                                dTotal += u.get('downtime');
                                count++;
                                if (count == 30) {
                                    currentPerc = uTotal / (uTotal + dTotal) * 100;
                                    uTotal = 0;
                                    dTotal = 0;
                                }
                            });

                            // account for the case where there are less than 30 data points
                            if (currentPerc > 0) {
                                oldPerc = uTotal / (uTotal + dTotal) * 100;
                            }
                            else {
                                currentPerc = uTotal / (uTotal + dTotal) * 100;
                                oldPerc = currentPerc;
                            }
                            var updown = (oldPerc == currentPerc) ? 'neutral' : (oldPerc < currentPerc) ? 'up' : 'down';
                            var widget_table = new Opty.PeriodCompareWidgetView({
                                title: 'land. pages uptime',
                                goal: '99.99%',
                                actual: Opty.util.formatNumber(currentPerc, 3) + '%',
                                type: updown,
                                delta: Opty.util.formatNumber(Math.abs(oldPerc - currentPerc), 3) + '%',
                                period: '30 days'
                            });

                            $divpages.append(widget_table.$el);
                        }

                    });

                    uptime_collection = new Opty.UptimeCollection({}, { 'monitorName': 'api', 'count': '60' });
                    uptime_collection.fetch({
                        success: function (uptimes) {
                            var currentPerc = 0;
                            var oldPerc = 0;
                            var uTotal = 0, dTotal = 0;
                            var count = 1;
                            uptimes.forEach(function (u) {
                                uTotal += u.get('uptime');
                                dTotal += u.get('downtime');
                                count++;
                                if (count == 30) {
                                    currentPerc = uTotal / (uTotal + dTotal) * 100;
                                    uTotal = 0;
                                    dTotal = 0;
                                }
                            });

                            // account for the case where there are less than 30 data points
                            if (currentPerc > 0) {
                                oldPerc = uTotal / (uTotal + dTotal) * 100;
                            }
                            else {
                                currentPerc = uTotal / (uTotal + dTotal) * 100;
                                oldPerc = currentPerc;
                            }
                            var updown = (oldPerc == currentPerc) ? 'neutral' : (oldPerc < currentPerc) ? 'up' : 'down';
                            var widget_table = new Opty.PeriodCompareWidgetView({
                                title: 'api uptime',
                                goal: '99.99%',
                                actual: Opty.util.formatNumber(currentPerc, 3) + '%',
                                type: updown,
                                delta: Opty.util.formatNumber(Math.abs(oldPerc - currentPerc), 3) + '%',
                                period: '30 days'
                            });

                            $divapi.append(widget_table.$el);
                        }

                    });

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
