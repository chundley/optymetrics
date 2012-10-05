if(!window.Opty) { window.Opty = {}; }

/**
 * Sales chart view
 */
Opty.SalesChart = Backbone.View.extend({
    salesChartOptions: {
        chart: {
            spacingRight: 20,
            type: 'area'
        },
        title: {
        },
        xAxis: { },
        yAxis: {
            title: {
            },
            min: 0,
            startOnTick: false,
            showFirstLabel: false
        },
        tooltip: {
            shared: true
        },
        legend: {
            enabled: true 
        },
        plotOptions: {
            area: {
                stacking: 'normal'
                , lineWidth: 0
            }
            , series: {
                    marker: {
                        radius: 0
                    }
                }


            , column: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#666666'
                }
            }
       },
       credits: {
           enabled: false
       }
    },

    initialize: function(options) {
        var me = this;

        _.bindAll(me, 'render', 'velocityDataChanged');

        me.series = options.series;
        me.xAxisLabels = options.xAxisLabels;
        me.title = options.title;
        me.yLabel = options.yLabel;
        me.id = options.id;
        if(options.type != null)
            me.type = options.type;
    },

    velocityDataChanged: function() {
        this.render();    
    },

    render: function() {
        var me = this;
        this.$el.empty();
        this.salesChartOptions.xAxis.categories = me.xAxisLabels;
        this.salesChartOptions.series = me.series;
        this.salesChartOptions.title.text = me.title;
        this.salesChartOptions.yAxis.title.text = me.yLabel;
        this.salesChartOptions.chart.renderTo = me.id;
        if(me.type != null)
            this.salesChartOptions.chart.type = me.type;
        this.chart = new Highcharts.Chart(this.salesChartOptions); 
           
        return this.$el;
    },

    convertDateToUTC: function(date) { 
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); }
    }
);
