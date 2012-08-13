var opty = opty || {};

opty.EngineeringView = Backbone.View.extend({
    id: 'engineering-view',
    className: 'row-fluid',

    initialize: function(options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render');
    },

    render: function() {
        switch(this.options.selected) {
            case 'bug-metrics': {
                break;
            }
            default: {
                var velocity_collection = new opty.VelocityCollection();
                var velocity_chart = new opty.VelocityChart({ collection: velocity_collection }); 
                
                this.$el.append(velocity_chart.$el); 
                
                velocity_collection.fetch();
                break;
            }
        }
      
        return this.$el;
    }
});
