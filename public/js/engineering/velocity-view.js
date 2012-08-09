var opty = opty || {};

opty.VelocityView = Backbone.View.extend({
    id: 'velocity-chart',

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
        this.$el.append($('svg'));

        var data = [];
        me.collection.each(function(model) {
            data.push([ new Date(model.get('day')), model.get('velocity') ]);
        });
       
        // define dimensions of graph
        var m = [80, 80, 80, 80]; // margins
        var w = 1200 - m[1] - m[3]; // width
        var h = 400 - m[0] - m[2]; // height

        var startDate = data[0][0];
        var endDate = data[data.length - 1][0];
        var timeStep = 86400000; // 1 day in ms

        // x axis is scale from startDate to endDate in day increments
        var x = d3.time.scale.utc().domain([startDate, endDate]).range([0, w]);

        // Y scale will fit values from 0-10 within pixels h-0 (Note the
        // inverted domain for the y-scale: bigger is up!)
        var y = d3.scale.linear().domain([0, d3.max(data, function(d) {
            return d[1]; 
        })]).range([h, 0]);

        var line1 = d3.svg.line()
            // assign the X function to plot our line as we wish
            .x(function(d,i) { 
                // verbose logging to show what's actually being done
                //console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
                // return the X coordinate where we want to plot this datapoint
                return x(d[0]); 
            })
            .y(function(d) { 
                // verbose logging to show what's actually being done
                //console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
                // return the Y coordinate where we want to plot this datapoint
                return y(d[1]);
            });
        
        // Add an SVG element with the desired dimensions and margin.
        var graph = d3.select('#' + me.id).append("svg:svg")
              .attr("width", w + m[1] + m[3])
              .attr("height", h + m[0] + m[2])
            .append("svg:g")
              .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
        
        // create yAxis
        var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(1);
        
        // Add the x-axis.
        graph.append("svg:g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + h + ")")
              .call(xAxis);
        
        
        // create left yAxis
        var yAxisLeft = d3.svg.axis().scale(y).ticks(6).orient("left");
        // Add the y-axis to the left
        graph.append("svg:g")
              .attr("class", "y axis")
              .attr("transform", "translate(-10,0)")
              .call(yAxisLeft);
        
        // add lines
        // do this AFTER the axes above so that the line is above the tick-lines
        graph.append("svg:path").attr("d", line1(data)).attr("class", "data1");

        // add the title
        graph.append('text')
            .attr('class', 'title-area')
            .attr('x', w / 2)
            .attr('y', '0')
            .attr('style', 'text-anchor:middle;')
            .text('Engineering Team Velocity');
        
        return this.$el;
    }
});

opty.VelocityModel = Backbone.Model.extend({});

opty.VelocityCollection = Backbone.Collection.extend({
    model: opty.VelocityModel, 
    url: '/dev/velocity'
});
