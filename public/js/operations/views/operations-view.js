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
                    // uptime widget for dashboard.optify.net
                    var uptime_collection = new opty.UptimeCollection({}, { 'monitorName': 'dashboard', 'count': '60' });
                    var that = this;
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
                            console.log(oldPerc + ' : ' + currentPerc);
                            var updown = (oldPerc < currentPerc) ? 'up' : 'down';
                            var widget_table = new opty.PeriodCompareWidgetView({
                                title: 'dashboard uptime',
                                goal: '99.99%',
                                actual: opty.util.formatNumber(currentPerc, 3) + '%',
                                type: updown,
                                delta: opty.util.formatNumber(Math.abs(oldPerc - currentPerc), 3) + '%',
                                period: '30 days'
                            });
                            that.$el.append($('<div>', { 'class': 'span4' }).append(widget_table.$el));
                        }

                    });

                    uptime_collection = new opty.UptimeCollection({}, { 'monitorName': 'service', 'count': '60' });
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
                            console.log(oldPerc + ' : ' + currentPerc);
                            var updown = (oldPerc < currentPerc) ? 'up' : 'down';
                            var widget_table = new opty.PeriodCompareWidgetView({
                                title: 'service uptime',
                                goal: '99.99%',
                                actual: opty.util.formatNumber(currentPerc, 3) + '%',
                                type: updown,
                                delta: opty.util.formatNumber(Math.abs(oldPerc - currentPerc), 3) + '%',
                                period: '30 days'
                            });
                            that.$el.append($('<div>', { 'class': 'span4' }).append(widget_table.$el));
                        }

                    });

                    uptime_collection = new opty.UptimeCollection({}, { 'monitorName': 'www', 'count': '60' });
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
                            console.log(oldPerc + ' : ' + currentPerc);
                            var updown = (oldPerc < currentPerc) ? 'up' : 'down';
                            var widget_table = new opty.PeriodCompareWidgetView({
                                title: 'pages uptime',
                                goal: '99.99%',
                                actual: opty.util.formatNumber(currentPerc, 3) + '%',
                                type: updown,
                                delta: opty.util.formatNumber(Math.abs(oldPerc - currentPerc), 3) + '%',
                                period: '30 days'
                            });
                            that.$el.append($('<div>', { 'class': 'span4' }).append(widget_table.$el));
                        }

                    });

                    break;
                }
        }


        return this.$el;
    }
});
