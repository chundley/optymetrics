if (!window.Opty) { window.Opty = {}; }

/**
* Category cost chart view
*/
Opty.CategoryCostChart = Backbone.View.extend({
    id: 'category-cost-chart',
    vendorCostChartOptions: {
        colors: ["#48a1d9", "#E97F02", "#d94848", "#0D6759"],
        chart: {
            renderTo: 'category-cost-chart',
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
            text: 'Operations cost by category',
            style: {
                color: '#cccccc'
            }
        },
        legend: {
            floating: true,
            align: 'left',
            verticalAlign: 'top',
            layout: 'vertical',
            backgroundColor: '#363636',
            borderColor: '#999999',
            borderWidth: 1,
            x: 60,
            y: 10,
            itemStyle: {
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
            area: {
                stacking: 'normal',
                marker: {
                    enabled: false
                }
            }

        },
        series: [{
            fillColor: {
                linearGradient: [0, 0, 0, 300],
                stops: [
                    [0, "#48a1d9"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'area',
            name: 'Overhead'
        }, {
            fillColor: {
                linearGradient: [0, 0, 0, 300],
                stops: [
                    [0, "#E97F02"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'area',
            name: 'Email'
        }, {
            fillColor: {
                linearGradient: [0, 0, 0, 400],
                stops: [
                    [0, "#d94848"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'area',
            name: 'SEO'
        }, {
            fillColor: {
                linearGradient: [0, 0, 0, 400],
                stops: [
                    [0, "#0D6759"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'area',
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
