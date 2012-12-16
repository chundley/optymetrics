if (!window.Opty) { window.Opty = {}; }

/**
* MRR rollup chart view
*/
Opty.AdoptionMetricChart = Backbone.View.extend({
    adoptionHistoryChartOptions: {
        colors: ["#3e8bbc", "#FA6900", "#5B4086", "#002066", "#7AB317", "#F2DB13", "#FE4365", "#EF3F00", "#C5BC8E", "#3D1C00"],
        chart: {
            renderTo: '',
            height: 200,
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
            enabled: false,
            text: '',
            style: {
                color: '#e3e3e3',
                fontSize: '11px'
            }
        },
        legend: {
            enabled: false,
            verticalAlign: 'bottom',
            layout: 'horizontal',
            backgroundColor: '#191919',
            borderColor: '#999999',
            borderWidth: 1,
            itemStyle: {
                fontSize: '9px',
                color: '#999999'
            }
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%m/%d'
            },
            gridLineColor: '#444444',
            gridLineWidth: 1,
            labels: {
                style: {
                    color: '#999999',
                    fontSize: '10px'
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
            startOnTick: false,
            showFirstLabel: true,
            labels: {
                formatter: function () {
                        return Highcharts.numberFormat(this.value, 0);
                },
                style: {
                    color: '#999999',
                    fontSize: '10px'
                }
            }
        }],
        tooltip: {
            shared: false/*,
            formatter: function () {
                return this.series.name + '<br>' + this.x + '<br>' + Highcharts.numberFormat(this.y, 0);
            }*/
        },
        plotOptions: {
            spline: {
                stacking: 'normal',
                marker: {
                    enabled: false
                },
                borderColor: '#999999'
            }

        },
        series: [
        {
            type: 'spline',
            name: 'Count',
            data: []
        }
        ],
        credits: {
            enabled: false
        }
    },

    initialize: function (attr, options) {
        var me = this;

        _.bindAll(me, 'render', 'adoptionTrendDataChanged');

        me.collection = options.collection;
        me.title = options.title;
        me.color = options.color;
        me.collection.on('reset', me.adoptionTrendDataChanged);
    },

    adoptionTrendDataChanged: function () {
        this.render();
    },

    render: function () {
        var me = this;
        this.$el.empty();
        me.adoptionHistoryChartOptions.series[0].data = [];
        var min = 100000000;
        this.collection.each(function(model) {
            if (model.get('count') < min) {
                min = model.get('count');
            }
            var dateFormatted = me.convertDateToUTC(new Date(model.get('weekOf')));
            me.adoptionHistoryChartOptions.series[0].data.push([dateFormatted, model.get('count')]);
        });

        me.adoptionHistoryChartOptions.series[0].color = [me.color];
        me.adoptionHistoryChartOptions.yAxis.min = min;
        me.adoptionHistoryChartOptions.title.text = me.title;
        me.adoptionHistoryChartOptions.chart.renderTo = this.id;
        this.chart = new Highcharts.Chart(this.adoptionHistoryChartOptions);
        return this.$el;
    },

    convertDateToUTC: function (date) {
        return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    },
    getDivId: function() {
        return this.divId;
    }
}
);
