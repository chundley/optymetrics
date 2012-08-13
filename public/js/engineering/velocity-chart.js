var opty = opty || {};

opty.VelocityChart = Backbone.View.extend({
    id: 'velocity-chart',

    velocity_chart_options: {
        chart: {
            renderTo: 'velocity-chart',
            zoomType: 'x',
            spacingRight: 20
        },
        title: {
            text: 'Engineering Team Velocity'
        },
        xAxis: {
            type: 'datetime'
        },
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
            enabled: false
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
            }
       },
       series: [{
           type: 'line',
           name: 'Team Velocity'
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

        var data = [];
        var categories = [];
        me.collection.each(function(model) {
            categories.push(me.convertDateToUTC(new Date(model.get('week_of'))));
            data.push(model.get('velocity'));
        });
      
        this.velocity_chart_options.xAxis.categories = categories;
        this.velocity_chart_options.series[0].data = data;
        this.chart = new Highcharts.Chart(this.velocity_chart_options); 

        return this.$el;
    },

    convertDateToUTC: function(date) { 
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); }
    }
);

opty.VelocityModel = Backbone.Model.extend({});

opty.VelocityCollection = Backbone.Collection.extend({
    model: opty.VelocityModel, 
    url: '/dev/velocity'
});
