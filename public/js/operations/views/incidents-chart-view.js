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
            column: {
                stacking: 'normal'
            }
        },
        series: [{
            type: 'column',
            name: 'PagerDuty'
        },
        {
            type: 'column',
            name: 'P1 Defect'
        }, 
        {
            type: 'column',
            name: 'Ops'
        },
        {
            type: 'column',
            name: 'On-call Engineer'
        }
        ],
        credits: {
            enabled: false
        }
    },

    incidentsThreshold: 2,

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

        this.chartOptions.series[0].data = me.formatData('PagerDuty');
        this.chartOptions.series[1].data = me.formatData('P1 Defect');
        this.chartOptions.series[2].data = me.formatData('Ops');
        this.chartOptions.series[3].data = me.formatData('On-call Engineer');

        this.chart = new Highcharts.Chart(this.chartOptions);
        return this.$el;
    },
    formatData: function (source) {
        var me = this,
            series = [],
            start = this.getUTCDay(this.collection.getStartDate()),
            end = this.getUTCDay(this.collection.getEndDate());
       
        this.collection.each(function(data) {
            if(data.get('source') == source) {
                series.push({ x: me.getUTCDay(new Date(data.get('date'))).getTime(), y: data.get('count') });
            } 
        });

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
