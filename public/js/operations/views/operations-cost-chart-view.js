if (!window.Opty) { window.Opty = {}; }

/**
* Operations cost chart view
*/
Opty.OperationsCostChart = Backbone.View.extend({
    id: 'operations-cost-chart',
    vendorCostChartOptions: {
        colors: ["#48a1d9", "#0c4e7f", "#6e317a", "#48a1d9", "#c5792a", "#00a695", "#f478a2"],
        chart: {
            renderTo: 'operations-cost-chart',
            spacingRight: 20,
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
            text: 'Total operations cost',
            style: {
                color: '#cccccc'
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
        },
        {
            // secondary y-axis for annotations
            labels: {
                enabled: false
            },
            gridLineColor: '#444444',
            title: null,
            max: 20000,
            opposite: false
        }],
        tooltip: {
            shared: false,
            formatter: function () {
                if (this.series.name == 'Annotation') {
                    return this.point.name;
                }
                else {
                    return this.x + '<br>$' + Highcharts.numberFormat(this.y, 0);
                }
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            line: {
                marker: {
                    radius: 8,
                    symbol: 'triangle',
                    states: {
                        hover: {
                            enabled: true
                        }
                    },
                    lineWidth: 2,
                    lineColor: '#48a1d9',
                    fillColor: '#000000'
                },

                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                lineWidth: 0
            },
            area: {
                lineWidth: 2,
                fillColor: {
                    linearGradient: [0, 0, 0, 400],
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, 'rgba(0,0,0,0)']
                    ]
                },
                marker: {
                    radius: 4,
                    lineWidth: 1,
                    lineColor: '#48a1d9',
                    fillColor: '#111111'
                }
            }
        },
        series: [{
            type: 'area',
            name: 'Cost'
        }, {
            type: 'line',
            name: 'Annotation',
            color: '#48a1d9',
            yAxis: 1
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
