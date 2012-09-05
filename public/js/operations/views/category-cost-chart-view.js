if (!window.Opty) { window.Opty = {}; }

/**
* Category cost chart view
*/
Opty.CategoryCostChart = Backbone.View.extend({
    id: 'category-cost-chart',
    vendorCostChartOptions: {
        colors: ["#002066", "#E97F02", "#5B4086", "#0D6759"],
        chart: {
            renderTo: 'category-cost-chart',
            backgroundColor: {
                linearGradient: [0, 0, 0, 300],
                stops: [
                    [0, '#fffef2'],
                    [1, '#dfded4']
                ]
            }
        },
        title: {
            text: 'Operations cost by category',
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
            areaspline: {
                stacking: 'normal',
                marker: {
                    enabled: false
                }
            }

        },
        series: [{
            type: 'areaspline',
            name: 'Overhead'
        }, {
            type: 'areaspline',
            name: 'Email'
        }, {
            type: 'areaspline',
            name: 'SEO'
        }, {
            type: 'areaspline',
            name: 'Traffic/Leads'
        }
        ],
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
        var overheadCost = [];
        var emailCost = [];
        var seoCost = [];
        var leadCost = [];

        var data = me.formatData();
        _.each(data, function (d) {
            categories.push(Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(d.month))));
            overheadCost.push(d.amountOverhead);
            emailCost.push(d.amountEmail);
            seoCost.push(d.amountSEO);
            leadCost.push(d.amountLeads);
        });

        this.vendorCostChartOptions.series[0].data = overheadCost;
        this.vendorCostChartOptions.series[1].data = emailCost;
        this.vendorCostChartOptions.series[2].data = seoCost;
        this.vendorCostChartOptions.series[3].data = leadCost;

        this.vendorCostChartOptions.xAxis.categories = categories
        this.chart = new Highcharts.Chart(this.vendorCostChartOptions);
        return this.$el;
    },
    formatData: function () {
        // get data set correctly for rendering the chart (dedup days, set annotations, etc.)
        var data = [];
        this.collection.each(function (model) {
            var found = false;
            _.each(data, function (d) {
                if (model.get('billingMonth') == d.month) {
                    d.amountOverhead += model.get('amountOverhead');
                    d.amountEmail += model.get('amountEmail');
                    d.amountSEO += model.get('amountSEO');
                    d.amountLeads += model.get('amountLeads');
                    found = true;
                }
            });
            if (!found) {
                data.push({
                    month: model.get('billingMonth'), 
                    amountOverhead: model.get('amountOverhead'), 
                    amountEmail: model.get('amountEmail'), 
                    amountSEO: model.get('amountSEO'), 
                    amountLeads: model.get('amountLeads'), 
                });
            }
        });
        return data;
    },
    convertDateToUTC: function (date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }
}
);
