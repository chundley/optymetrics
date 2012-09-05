if (!window.Opty) { window.Opty = {}; }

/**
* Vendor cost chart view
*/
Opty.VendorCostChart = Backbone.View.extend({
    id: 'vendor-cost-chart',
    vendorCostChartOptions: {
        colors: ["#002066", "#E97F02", "#5B4086", "#0D6759"],
        chart: {
            renderTo: 'vendor-cost-chart',
            backgroundColor: {
                linearGradient: [0, 0, 0, 300],
                stops: [
                    [0, '#fffef2'],
                    [1, '#dfded4']
                ]
            }
        },
        title: {
            text: 'Operations cost by vendor',
            style: {
                color: '#3e3e3e'
            }
        },
        legend: {
            floating: true,
            align: 'left',
            verticalAlign: 'top',
            layout: 'vertical',
            backgroundColor: '#ffffff',
            borderColor: '#ECE5CE',
            borderWidth: 2,
            x: 80,
            y: 35
        },
        xAxis: {},
        yAxis: [{
            title: {
                text: null,
                style: {
                    color: '#3e3e3e',
                    fontSize: '13px',
                    fontWeight: 'normal'
                }
            },
            min: 0,
            startOnTick: true,
            showFirstLabel: false,
            labels: {
                formatter: function () {
                    return '$' + Highcharts.numberFormat(this.value / 1000, 0) + 'K';
                }
            }
        }],
        tooltip: {
            shared: false,
            formatter: function () {
                return this.series.name + '<br>' + this.x + '<br>$' + Highcharts.numberFormat(this.y, 0);
            }
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                marker: {
                    enabled: false
                }
            }

        },
        //series: null,
        credits: {
            enabled: false
        }
    },

    initialize: function (options) {
        var me = this;

        _.bindAll(me, 'render', 'vendorCostDataChanged');

        me.collection = options.collection;
        me.collection.on('reset', me.vendorCostDataChanged);
    },

    vendorCostDataChanged: function () {
        this.render();
    },

    render: function () {
        var me = this;
        this.$el.empty();

        var categories = [];
        me.vendorCostChartOptions.series = [];

        var data = me.formatData();
        _.each(data, function (d) {
            var series = {};
            series.name = d.vendorName;
            series.type = 'column';
            series.data = [];
            var stack;
            categories = []; // fix this later
            _.each(d.costData, function (cd) {
                series.data.push(cd.amount);
                stack = cd.billingMonth;
                categories.push(Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(stack))));
            });
            series.data.stack = stack;
            me.vendorCostChartOptions.series.push(series);
        });

        me.vendorCostChartOptions.xAxis.categories = categories
        this.chart = new Highcharts.Chart(this.vendorCostChartOptions);

        return this.$el;
    },
    formatData: function () {
        // this function sucks but is necessary to get the data perfect for HighCharts
        var me = this;
        var data = [];
        var days = [];

        // first get distinct dates
        this.collection.each(function (model) {
            var found = false;
            _.each(days, function (day) {
                if (!found && (day == model.get('billingMonth'))) {
                    found = true;
                }
            });
            if (!found) {
                days.push(model.get('billingMonth'));
            }
        });

        // second get list of distinct vendors, initialize days
        this.collection.each(function (model) {
            var found = false;
            _.each(data, function (d) {
                if (d.vendorName == model.get('vendorName')) {
                    found = true;
                }
            });
            if (!found) {
                var cd = [];
                _.each(days, function (day) {
                    cd.push({ billingMonth: day, amount: 0 });
                });
                data.push({ vendorName: model.get('vendorName'), costData: cd });
            }
        });

        // now walk through unique vendor names and get all the associated cost data
        _.each(data, function (d) {
            me.collection.each(function (model) {
                if (d.vendorName == model.get('vendorName')) {
                    _.each(d.costData, function (cd) {
                        if (cd.billingMonth == model.get('billingMonth')) {
                            cd.amount = model.get('amount');
                        }
                    });
                }
            });
        });
        return data;
    },
    convertDateToUTC: function (date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }
}
);
