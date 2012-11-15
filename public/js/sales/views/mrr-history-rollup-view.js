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
            text: 'MRR Software vs. Services',
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

        var data = me.formatData();
        _.each(data, function (d) {
            categories.push(Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(d.dateAdded))));
            software.push(d.software);
            services.push(d.services);
        });

        this.mrrRollupChartOptions.series[0].data = software;
        this.mrrRollupChartOptions.series[1].data = services;
        this.mrrRollupChartOptions.xAxis.categories = categories

        this.chart = new Highcharts.Chart(this.mrrRollupChartOptions);
        return this.$el;
    },

    formatData: function () {
        // get data set correctly for rendering the chart (dedup days, set annotations, etc.)
        var data = [];
        this.collection.each(function (model) {
            var found = false;
            _.each(data, function (d) {
                if (model.get('dateAdded') == d.dateAdded) {
                    // would be nice if these weren't hard-coded to allow future proofing for other product types
                    if (model.get('productType') == 'Software') {
                        d.software += model.get('totalPrice')
                    }
                    else if (model.get('productType') == 'Services') {
                        d.services += model.get('totalPrice');
                    }
                    found = true;
                }
            });
            // date wasn't found - add to results
            if (!found) {
                if (model.get('productType') == 'Software') {
                    data.push({
                        dateAdded: model.get('dateAdded'),
                        software: model.get('totalPrice'),
                        services: 0
                    });
                }
                else {
                    data.push({
                        dateAdded: model.get('dateAdded'),
                        services: model.get('totalPrice'),
                        software: 0
                    });
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
