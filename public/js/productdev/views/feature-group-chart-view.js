if(!window.Opty) { window.Opty = {}; }

/**
 * Development budget allocated by feature group
 */
Opty.FeatureGroupChartView = Backbone.View.extend({
    id: 'feature-group-chart',
    className: 'widget-white',
    chartOptions: {
        chart: {
            renderTo: 'feature-group-chart',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: true
        },
        title: {
            text: 'Points allocated by Feature Group (Deployed)'
        },
        tooltip: {
            enabled: false 
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    connectorColor: '#000000',
                    formatter: function() {
                        return '<b>' + this.point.name + '</b>:' + Math.round(this.percentage) + '%';
                    }
                },
                point: {
                    events: {
                        click: function() {
                            Opty.pubsub.trigger('featuregroup:changed', this.name);
                        }
                    }
                }      
            }
        },
        series: [{
            type: 'pie',
            name: 'Feature groups'
        }],
        credits: {
            enabled: false
        }
    },

    initialize: function(options) {
        var me = this;

        _.bindAll(me, 'render', 'chartDataChanged');

        me.collection = options.collection;
        me.collection.on('reset', me.chartDataChanged);
    },

    chartDataChanged: function() {
        this.render();
    },

    render: function() {
        var me = this;
        this.$el.empty();

        var data = [], total = 0;
        me.collection.each(function(model) {
            total += model.get('size');
        });

        me.collection.each(function(model) {
            data.push([ model.get('featureGroup'), Math.round((model.get('size') / total) * 100) ]);    
        });
   
        this.chartOptions.series[0].data = data;
        this.chart = new Highcharts.Chart(this.chartOptions);

        return this.$el;
    }
});
