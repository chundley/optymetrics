if (!window.Opty) { window.Opty = {}; }

/**
* MRR rollup chart view
*/
Opty.MRRRollupChart = Backbone.View.extend({
    id: 'mrr-rollup-chart',
    mrrRollupChartOptions: {
        colors: ["#3e8bbc", "#FA6900", "#5B4086", "#002066", "#7AB317", "#F2DB13", "#FE4365", "#EF3F00", "#C5BC8E", "#3D1C00"],
        chart: {
            renderTo: 'mrr-rollup-chart',
            events: { // placeholder to be replaced in code later
                load: function() {
                }
            },
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
            text: 'Total MRR Software vs. Services',
            style: {
                color: '#e3e3e3'
            }
        },
        legend: {
            verticalAlign: 'bottom',
            layout: 'horizontal',
            backgroundColor: '#191919',
            borderColor: '#999999',
            borderWidth: 1,
            itemStyle: {
                fontSize: '12px',
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
        series: [
        {
            color: {
                linearGradient: [0, 0, 0, 400],
                stops: [
                    [0, "#48a1d9"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'column',
            name: 'Software'
        },
        {
            color: {
                linearGradient: [0, 0, 0, 600],
                stops: [
                    [0, "#f04720"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'column',
            name: 'Services'
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

        var categories = [];
        var software = [];
        var services = [];

        this.collection.each(function(model){
            categories.push(Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(model.get('dateAdded')))));
            if (model.get('software')) {
                software.push(model.get('software'));
            }
            else {
                software.push(0);
            }
            
            if (model.get('services')) {
                services.push(model.get('services'));
            }
            else {
                services.push(0);
            }
        });

        this.mrrRollupChartOptions.series[0].data = software;
        this.mrrRollupChartOptions.series[1].data = services;
        this.mrrRollupChartOptions.series[1].visible = false;
        this.mrrRollupChartOptions.xAxis.categories = categories

        this.mrrRollupChartOptions.chart.events.load = function() {
            var start = new Date(me.collection.models[0].get('dateAdded')).getTime() - 111600000; // subtract one hour in ms to correct for start date
            var end = new Date(me.collection.models[me.collection.models.length-1].get('dateAdded')).getTime();
            this.renderer.image('/img/export.png', 7, 385, 54, 9)
                .on('click', function() {
                    location.href = '/rest/sales/mrrs-by-product-csv?start=' + start + '&end=' + end;
                })
                .css({
                    cursor: 'pointer'
                })
                .attr({
                    zIndex: -100
                })
                .add();
        };

        this.chart = new Highcharts.Chart(this.mrrRollupChartOptions);
        return this.$el;
    },

    convertDateToUTC: function (date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }

}
);
