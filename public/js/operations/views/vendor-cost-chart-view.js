if (!window.Opty) { window.Opty = {}; }

/**
* Vendor cost chart view
*/
Opty.VendorCostChart = Backbone.View.extend({
    id: 'vendor-cost-chart',
    vendorCostChartOptions: {
        chart: {
            renderTo: 'vendor-cost-chart',
            spacingRight: 20
        },
        title: {
            text: 'Vendor Cost'
        },
        xAxis: {},
        yAxis: {
            title: {
                text: 'Cost'
            },
            min: 0,
            startOnTick: false,
            showFirstLabel: false
        },
        tooltip: {
            shared: true
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: true,
                        radius: 5
                    }
                }
            }
        },
        series: [{
            type: 'line',
            name: 'Cost'
        }],
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
        var cost = [];

        var data = me.formatData();
        _.each(data, function (d) {
            categories.push(Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(d.month))));
            cost.push(d.amount);
        });

        this.vendorCostChartOptions.series[0].data = cost;
        this.vendorCostChartOptions.xAxis.categories = categories;
        this.chart = new Highcharts.Chart(this.vendorCostChartOptions);
        return this.$el;
    },
    formatData: function () {
        // get data set correctly for rendering the chart (dedup days)
        var data = [];
        this.collection.each(function (model) {
            var found = false;
            _.each(data, function (d) {
                if (model.get('billingMonth') == d.month) {
                    d.amount += model.get('amount');
                    found = true;
                }
            });
            if (!found) {
                data.push({ month: model.get('billingMonth'), amount: model.get('amount') });
            }
        });
        return data;
    },
    convertDateToUTC: function (date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }
}
);
