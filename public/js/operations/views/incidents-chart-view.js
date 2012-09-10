if (!window.Opty) { window.Opty = {}; }

/**
* Operations incidents chart view
*/
Opty.IncidentsChartView = Backbone.View.extend({
    id: 'incidents-chart',
    className: 'widget-white',
    chartOptions: {
        colors: ["#0D6759", "#0c4e7f", "#6e317a", "#48a1d9", "#c5792a", "#00a695", "#f478a2"],
        chart: {
            renderTo: 'incidents-chart',
            spacingRight: 20,
            backgroundColor: {
                linearGradient: [0, 0, 0, 300],
                stops: [
                    [0, '#fffef2'],
                    [1, '#dfded4']
                ]
            }
        },
        title: {
            text: 'Production Incidents',
            style: {
                color: '#3e3e3e'
            }
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: [{
            title: {
                text: null,
                style: {
                    color: '#3e3e3e',
                    fontSize: '13px',
                    fontWeight: 'normal'
                }
            },
            labels: {
                formatter: function() {
                    return (this.value % 1 == 0) ? this.value : '';
                }
            },
            min: 0,
            startOnTick: true,
            tickInterval: 1,
            showFirstLabel: false,
        },
        ],
        tooltip: {
            shared: false,
            formatter: function () {
                var date = new Date(this.x);
                return (date.getUTCMonth() + 1) + '/' + date.getUTCDate() + '/' + date.getUTCFullYear() + ': ' + Highcharts.numberFormat(this.y, 0);
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            spline: {
                marker: {
                    radius: 5,
                    lineWidth: 2,
                    lineColor: '#0D6759',
                    fillColor: '#ffffff'
                }
            }
        },
        series: [{
            type: 'spline',
            name: 'Cost'
        }
        ],
        credits: {
            enabled: false
        }
    },

    initialize: function (options) {
        var me = this;

        _.bindAll(me, 'render', 'incidentsDataChanged', 'formatData');

        me.collection = options.collection;
        me.collection.on('reset', me.incidentsDataChanged);
    },

    incidentsDataChanged: function () {
        this.render();
    },

    render: function () {
        var me = this;
        this.$el.empty();

        var data = me.formatData();

        this.chartOptions.series[0].data = data;
        this.chart = new Highcharts.Chart(this.chartOptions);
        return this.$el;
    },
    formatData: function () {
        var me = this,
            series = [],
            start = this.getUTCDay(this.collection.getStartDate()),
            end = this.getUTCDay(this.collection.getEndDate());
        
        while(start < end) {
            var aggregate = this.collection.find(function(agg) { 
                return Date.compare(me.getUTCDay(new Date(agg.get('date'))), start) == 0; 
            });
            if(aggregate) {
                series.push([ me.getUTCDay(new Date(aggregate.get('date'))).getTime(), aggregate.get('count') ]);
            } else {
                series.push([ start.getTime(), 0 ]);  
            }

            start = me.getUTCDay(start.add(1).days())
        }
        return series;
    },
    getUTCDay: function(date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    },
    convertDateToUTC: function (date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }
}
);
