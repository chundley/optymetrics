if (!window.Opty) { window.Opty = {}; }

/**
* MRR sku chart view
*/
Opty.MRRSKUChart = Backbone.View.extend({
    id: 'mrr-sku-chart',
    mrrSKUChartOptions: {
        colors: ["#3e8bbc", "#FA6900", "#5B4086", "#002066", "#7AB317", "#F2DB13", "#FE4365", "#EF3F00", "#C5BC8E", "#3D1C00"],
        chart: {
            renderTo: 'mrr-sku-chart',
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
            text: 'Software-only MRR by SKU',
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
                linearGradient: [0, 0, 0, 600],
                stops: [
                    [0, "#0c4e7f"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'column',
            name: 'Enterprise'
        },
        {
            color: {
                linearGradient: [0, 0, 0, 600],
                stops: [
                    [0, "#f07935"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'column',
            name: 'Pro'
        },
        {
            color: {
                linearGradient: [0, 0, 0, 600],
                stops: [
                    [0, "#24c17d"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'column',
            name: 'Express'
        },
        {
            color: {
                linearGradient: [0, 0, 0, 600],
                stops: [
                    [0, "#b261bd"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'column',
            name: 'Agency'
        }
        ],
        credits: {
            enabled: false
        }
    },

    initialize: function (options) {
        var me = this;

        _.bindAll(me, 'render', 'mrrSKUDataChanged');

        me.collection = options.collection;
        me.collection.on('reset', me.mrrSKUDataChanged);
    },

    mrrSKUDataChanged: function () {
        this.render();
    },

    render: function () {
        var me = this;
        this.$el.empty();

        var categories = [];
        var enterprise = [];
        var pro = [];
        var express = [];
        var agency = [];

        this.collection.each(function(model){
            categories.push(Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(model.get('dateAdded')))));
            if (model.get('enterprise')) {
                enterprise.push(model.get('enterprise'));
            }
            else {
                enterprise.push(0);
            }

            if (model.get('pro')) {
                pro.push(model.get('pro'));
            }
            else {
                pro.push(0);
            }
            
            if (model.get('express')) {
                express.push(model.get('express'));
            }
            else {
                express.push(0);
            }

            if (model.get('agency')) {
                agency.push(model.get('agency'));
            }
            else {
                agency.push(0);
            }
            
        });

        this.mrrSKUChartOptions.series[0].data = enterprise;
        this.mrrSKUChartOptions.series[1].data = pro;
        this.mrrSKUChartOptions.series[2].data = express;
        this.mrrSKUChartOptions.series[3].data = agency;
        this.mrrSKUChartOptions.xAxis.categories = categories

        this.chart = new Highcharts.Chart(this.mrrSKUChartOptions);
        return this.$el;
    },

    convertDateToUTC: function (date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }
}
);
