if (!window.Opty) { window.Opty = {}; }

/**
* MRR rollup chart view
*/
Opty.BigscoreCustomerHistoryChart = Backbone.View.extend({
    id: 'bigscore-customer-history-chart',
    bigscoreCustomerHistoryChartOptions: {
        colors: ["#3e8bbc", "#FA6900", "#5B4086", "#002066", "#7AB317", "#F2DB13", "#FE4365", "#EF3F00", "#C5BC8E", "#3D1C00"],
        chart: {
            renderTo: 'bigscore-customer-history-chart',
            height: 270,
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
            text: 'Big Score 90-day trend',
            style: {
                color: '#e3e3e3',
                fontSize: '14px'
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
            min: 0,
            max: 100,
            startOnTick: true,
            showFirstLabel: true,
            labels: {
                formatter: function () {
                        return Highcharts.numberFormat(this.value, 0);
                },
                style: {
                    color: '#999999',
                    fontSize: '11px'
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
            color: {
                linearGradient: [0, 0, 0, 0],
                stops: [
                    [0, "#FA6900"],
                    [1, 'rgba(255,255,0,0)']
                ]
            },
            type: 'spline',
            name: 'Big Score',
            data: []
        }
        ],
        credits: {
            enabled: false
        }
    },

    initialize: function (options) {
        var me = this;

        _.bindAll(me, 'render', 'mrrHistoryDataChanged');

        me.collection = options.collection;
        me.collection.on('reset', me.mrrHistoryDataChanged);
    },

    mrrHistoryDataChanged: function () {
        this.render();
    },

    render: function () {
        var me = this;
        this.$el.empty();

        me.bigscoreCustomerHistoryChartOptions.series[0].data = [];
        this.collection.each(function(model) {
            var dateFormatted = me.convertDateToUTC(new Date(model.get('scoreDate')));
            me.bigscoreCustomerHistoryChartOptions.series[0].data.push([dateFormatted, model.get('bigScore')]);            
        });

        this.chart = new Highcharts.Chart(this.bigscoreCustomerHistoryChartOptions);
        return this.$el;
    },

    convertDateToUTC: function (date) {
        return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    }
}
);
