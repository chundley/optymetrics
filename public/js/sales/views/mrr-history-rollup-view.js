if (!window.Opty) { window.Opty = {}; }

/**
* MRR rollup chart view
*/
Opty.MRRRollupChart = Backbone.View.extend({
    id: 'mrr-rollup-chart',
    vendorCostChartOptions: {
        colors: ["#3e8bbc", "#FA6900", "#5B4086", "#002066", "#7AB317", "#F2DB13", "#FE4365", "#EF3F00", "#C5BC8E", "#3D1C00"],
        chart: {
            renderTo: 'mrr-rollup-chart',
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
            text: 'MRR by product type',
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
            column: {
                stacking: 'normal',
                marker: {
                    enabled: false
                },
                borderColor: '#999999'
            }

        },
        series: [{
            type: 'column',
            name: 'MRR'
        }
        ],  
        credits: {
            enabled: false
        }
    },

    initialize: function (options) {
        var me = this;

        _.bindAll(me, 'render', 'mrrRollupDataChanged');

        me.collection = options.collection;
        me.collection.on('reset', me.mrrRollupDataChanged);
    },

    mrrRollupDataChanged: function () {
        this.render();
    },

    render: function () {
        var me = this;
        this.$el.empty();

        /*
        var categories = [];
        var cost = [];
        var note = [];

        var data = me.formatData();
        _.each(data, function (d) {
            categories.push(Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(d.month))));
            cost.push(d.amount);
            if (d.note) {
                note.push({ y: 2000, name: d.note });
            }
            else {
                note.push(null);
            }
        });

        this.vendorCostChartOptions.series[0].data = cost;
        this.vendorCostChartOptions.series[1].data = note;
        this.vendorCostChartOptions.xAxis.categories = categories
        */
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
                    d.amount += model.get('amount');
                    if (model.get('notes').length > 0) {
                        if (d.note) {
                            d.note = d.note + '<br>• ' + model.get('notes');
                        }
                        else {
                            d.note = '<b>Significant changes</b><br>• ' + model.get('notes');
                        }
                    }
                    found = true;
                }
            });
            if (!found) {
                if (model.get('notes').length > 0) {
                    data.push({ month: model.get('billingMonth'), amount: model.get('amount'), note: '<b>Significant changes</b><br>• ' + model.get('notes') });
                }
                else {
                    data.push({ month: model.get('billingMonth'), amount: model.get('amount'), note: null });
                }
            }
        });
        return data;
    },

    convertDateToUTC: function (date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }
}
);
