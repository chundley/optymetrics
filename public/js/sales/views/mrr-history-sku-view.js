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
            text: 'Software MRR by SKU',
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

        var data = me.formatData();
        _.each(data, function (d) {
            categories.push(Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(d.dateAdded))));
            enterprise.push(d.enterprise);
            pro.push(d.pro);
            express.push(d.express);
            agency.push(d.agency);
        });

        this.mrrSKUChartOptions.series[0].data = enterprise;
        this.mrrSKUChartOptions.series[1].data = pro;
        this.mrrSKUChartOptions.series[2].data = express;
        this.mrrSKUChartOptions.series[3].data = agency;
        this.mrrSKUChartOptions.xAxis.categories = categories

        this.chart = new Highcharts.Chart(this.mrrSKUChartOptions);
        return this.$el;
    },

    formatData: function () {
        // get data set correctly for rendering the chart
        var data = [];
        this.collection.each(function (model) {
            var found = false;
            _.each(data, function (d) {
                if (model.get('dateAdded') == d.dateAdded && model.get('productType') == 'Software') {
                    // would be nice if these weren't hard-coded to allow future proofing for other skus
                    if (model.get('sku') == 'ENTERPRISE') {
                        d.enterprise += model.get('totalPrice')
                    }
                    else if (model.get('sku') == 'PRO') {
                        d.pro += model.get('totalPrice');
                    }
                    else if (model.get('sku') == 'EXPRESS') {
                        d.express += model.get('totalPrice');
                    }
                    else if (model.get('sku') == 'AGENCY') {
                        d.agency += model.get('totalPrice');
                    }
                    found = true;
                }
            });
            // date wasn't found - add to results
            if (!found && model.get('productType') == 'Software') {
                if (model.get('sku') == 'ENTERPRISE') {
                    data.push({
                        dateAdded: model.get('dateAdded'),
                        enterprise: model.get('totalPrice'),
                        pro: 0,
                        express: 0,
                        agency: 0
                    });
                }
                else if (model.get('sku') == 'PRO') {
                    data.push({
                        dateAdded: model.get('dateAdded'),
                        pro: model.get('totalPrice'),
                        enterprise: 0,
                        express: 0,
                        agency: 0
                    });
                }
                else if (model.get('sku') == 'EXPRESS') {
                    data.push({
                        dateAdded: model.get('dateAdded'),
                        express: model.get('totalPrice'),
                        enterprise: 0,
                        pro: 0,
                        agency: 0
                    });
                }
                else if (model.get('sku') == 'AGENCY') {
                    data.push({
                        dateAdded: model.get('dateAdded'),
                        agency: model.get('totalPrice'),
                        enterprise: 0,
                        express: 0,
                        pro: 0
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
