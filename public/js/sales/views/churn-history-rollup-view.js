if (!window.Opty) { window.Opty = {}; }

/**
* MRR rollup chart view
*/
Opty.ChurnRollupChart = Backbone.View.extend({
    id: 'churn-rollup-chart',
    churnRollupChartOptions: {
        colors: ["#3e8bbc", "#FA6900", "#5B4086", "#002066", "#7AB317", "#F2DB13", "#FE4365", "#EF3F00", "#C5BC8E", "#3D1C00"],
        chart: {
            renderTo: 'churn-rollup-chart',
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
            text: 'MRR Churn vs. New Business',
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
                    return '$' + Highcharts.numberFormat(this.value, 0);
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
                linearGradient: [0, 0, 0, 1000],
                stops: [
                    [0, "#941919"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'column',
            name: 'Software Churn',
            stack: 'churn'
        },
        {
            color: {
                linearGradient: [0, 0, 0, 1000],
                stops: [
                    [0, "#af521f"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'column',
            name: 'Services Churn',
            stack: 'churn'
        },
        {
            color: {
                linearGradient: [0, 0, 0, 1000],
                stops: [
                    [0, "#02660e"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'column',
            name: 'New Software',
            stack: 'new'
        },
        {
            color: {
                linearGradient: [0, 0, 0, 1000],
                stops: [
                    [0, "#026659"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'column',
            name: 'New Services',
            stack: 'new'
        }        
        ],
        credits: {
            enabled: false
        }
    },

    initialize: function (options) {
        var me = this;

        _.bindAll(me, 'render', 'churnRollupDataChanged');

        me.churn = options.churn;
        me.newsales = options.newsales;

        me.churn.on('reset', me.churnRollupDataChanged);
        me.newsales.on('reset', me.churnRollupDataChanged);
    },

    churnRollupDataChanged: function () {
        this.render();
    },

    render: function () {
        var me = this;
        this.$el.empty();

        var categories = [];
        var softwareChurn = [];
        var servicesChurn = [];
        var softwareNew = [];
        var servicesNew = [];

        // bunch of code to get unique dates between the two data sets and format them correctly
        var catTemp = [];
        this.newsales.each(function(model) {
            catTemp.push(model.get('dateAdded'));
        });

        this.churn.each(function(model) {
            catTemp.push(model.get('dateAdded'));
        });

        // dedup
        categories = catTemp.filter(function(elem, pos) {
            return catTemp.indexOf(elem) == pos;
        });
        
        // sort (they can be out of order after dedup)
        categories.sort();

        // format correctly
        for (var i=0; i<categories.length; i++) {
            categories[i] = Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(categories[i])));
        }

        // set arrays of data for chart output
        for (var i=0; i<categories.length; i++) {
            var found = false;
            this.newsales.each(function(model){
                if (Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(model.get('dateAdded')))) == categories[i] ) {
                    // dirty hack - this is our first date and makes everything look like new business
                    if (model.get('dateAdded').toString() != '2011-12-31T08:00:00.000Z') {
                        found = true;
                        softwareNew.push(model.get('software'));
                        servicesNew.push(model.get('services'));
                    }
                }
            });
            if (!found) {
                softwareNew.push(0);
                servicesNew.push(0);  
            }
        }

        for (var i=0; i<categories.length; i++) {
            var found = false;
            this.churn.each(function(model){
                if (Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(model.get('dateAdded')))) == categories[i] ) {
                    found = true;
                    softwareChurn.push(model.get('software'));
                    servicesChurn.push(model.get('services'));                    
                }
            });
            if (!found) {
                softwareChurn.push(0);
                servicesChurn.push(0);  
            }
        }

/*
        this.churn.each(function(model){
            softwareChurn.push(model.get('software'));
            servicesChurn.push(model.get('services'));
        });
*/

        this.churnRollupChartOptions.series[0].data = softwareChurn;
        this.churnRollupChartOptions.series[1].data = servicesChurn;
        this.churnRollupChartOptions.series[2].data = softwareNew;
        this.churnRollupChartOptions.series[3].data = servicesNew;        
        this.churnRollupChartOptions.xAxis.categories = categories

        this.chart = new Highcharts.Chart(this.churnRollupChartOptions);
        return this.$el;
    },

    convertDateToUTC: function (date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }
}
);
