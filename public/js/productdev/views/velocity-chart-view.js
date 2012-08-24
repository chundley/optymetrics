if(!window.Opty) { window.Opty = {}; }

/**
 * Velocity chart view
 */
Opty.VelocityChart = Backbone.View.extend({
    id: 'velocity-chart',
    velocityChartOptions: {
        chart: {
            renderTo: 'velocity-chart',
            spacingRight: 20
        },
        title: {
            text: 'Engineering Team Velocity'
        },
        xAxis: { },
        yAxis: {
            title: {
                text: 'Story Points'
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
            marker: {
                enabled: false,
                states: {
                  hover: {
                      enabled: true,
                      radius: 5
                  }
                }
            },

            column: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#666666'
                }
            }
       },
       series: [{
           type: 'column',
           name: 'Features'
       },
       {
            type: 'column',
            name: 'Defects'
       },
       {
            type: 'column',
            name: 'Engineering Excellence'
       }],
       credits: {
           enabled: false
       }
    },

    initialize: function(options) {
        var me = this;

        _.bindAll(me, 'render', 'velocityDataChanged');

        me.collection = options.collection;
        me.collection.on('reset', me.velocityDataChanged);
    },

    velocityDataChanged: function() {
        this.render();    
    },

    render: function() {
        var me = this;
        this.$el.empty();

        var features = [], defects = [], excellence = [];
        var categories = [];
        me.collection.each(function(model) {
            if(model.get('total')) {
                categories.push(Highcharts.dateFormat('Week of %b %e', me.convertDateToUTC(new Date(model.get('week_of')))));
                features.push(model.get('feature_velocity'));
                defects.push(model.get('defect_velocity'));
                excellence.push(model.get('excellence_velocity'));
            }
        });
      
        this.velocityChartOptions.xAxis.categories = categories;
        this.velocityChartOptions.series[0].data = features;
        this.velocityChartOptions.series[1].data = defects;
        this.velocityChartOptions.series[2].data = excellence;
        this.chart = new Highcharts.Chart(this.velocityChartOptions); 

        return this.$el;
    },

    convertDateToUTC: function(date) { 
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); }
    }
);
