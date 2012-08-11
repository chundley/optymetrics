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

        var data = [];
        me.collection.each(function(model) {
            data.push([ new Date(model.get('week_of')), model.get('velocity') ]);
        });
        
        return this.$el;
    }
});

opty.VelocityModel = Backbone.Model.extend({});

opty.VelocityCollection = Backbone.Collection.extend({
    model: opty.VelocityModel, 
    url: '/dev/velocity'
});
