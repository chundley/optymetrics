if (!window.Opty) { window.Opty = {}; }

/**
* Vendor cost chart view
*/
Opty.VendorCostChart = Backbone.View.extend({
    id: 'vendor-cost-chart',
    vendorCostChartOptions: {
        colors: ["#3e8bbc", "#FA6900", "#5B4086", "#002066", "#7AB317", "#F2DB13", "#FE4365", "#EF3F00", "#C5BC8E", "#3D1C00"],
        chart: {
            renderTo: 'vendor-cost-chart',
            borderColor: '#999999',
            borderWidth: 1,
            borderRadius: 6,
            backgroundColor: {
                linearGradient: [0, 0, 0, 300],
                stops: [
                    [0, '#363636'],
                    [1, '#191919']
                ]
            }
        },
        title: {
            text: 'Operations cost by vendor',
            style: {
                color: '#e3e3e3'
            }
        },
        legend: {
            //floating: true,
            //align: 'bottom',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            backgroundColor: '#191919',
            borderColor: '#999999',
            borderWidth: 1,
            //x: 40,
            //y: 20,
            //width: 200, // width and itemWidth create the two-column look
            //itemWidth: 100,
            itemStyle: {
                fontSize: '10px',
                color: '#999999'
            }
        },
        xAxis: {
            gridLineColor: '#444444',
            gridLineWidth: 1,
            labels: {
                style: {
                    color: '#999999'
                }
            }
        },
        yAxis: [{
            gridLineColor: '#444444',
            title: {
                text: null,
                style: {
                    color: '#e3e3e3',
                    fontSize: '13px',
                    fontWeight: 'normal'
                }
            },
            min: 0,
            startOnTick: true,
            showFirstLabel: false,
            labels: {
                formatter: function () {
                    if (this.value >= 1000) {
                        return '$' + Highcharts.numberFormat(this.value / 1000, 0) + 'K';
                    }
                    else {
                        return '$' + Highcharts.numberFormat(this.value, 0);
                    }
                },
                style: {
                    color: '#999999'
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
                },
                borderColor: '#999999'
            }

        },
        //series: null,  (created dynamically for this chart)
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
        var idx = 0;
        _.each(data, function (d) {
            var series = {};
            series.name = d.vendorName;
            series.type = 'column';
            var tempColor = {
                linearGradient: [0, 0, 0, 500 + (50 * idx)],
                stops: [
                    [0, me.vendorCostChartOptions.colors[idx]],
                    [1, 'rgba(0,0,0,0)']
                ]
            };

            series.color = tempColor;
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
            idx++;
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

        // now walk through unique vendor names and get all the associated cost data for each month
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
