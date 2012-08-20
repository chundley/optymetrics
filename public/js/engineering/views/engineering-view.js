if(!window.Opty) { window.Opty = {}; }

Opty.EngineeringView = Backbone.View.extend({
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
                var velocity_collection = new Opty.VelocityCollection();
                
                var velocity_chart = new Opty.VelocityChart({ collection: velocity_collection }); 
                this.$el.append(velocity_chart.$el);
                
                var velocity_table = new opty.TableView({
                    table_fields: [
                      {
                          field: 'week_of',
                          display_name: 'Week Of',
                          formatter: function(data) {
                              if(data) {
                                  var date = new Date(data);
                                  return date.getFullYear() + '-' + opty.util.padNumber(date.getMonth() + 1, 2) + '-' + opty.util.padNumber(date.getDate(), 2); 
                              } else {
                                  return "";
                              }
                          }
                      },
                      {
                          field: 'feature_velocity',
                          display_name: 'Feature',
                          text_align: 'right'
                      },
                      {
                          field: 'defect_velocity',
                          display_name: 'Defect',
                          text_align: 'right'
                      },
                      {
                          field: 'excellence_velocity',
                          display_name: 'Engineering Excellence',
                          text_align: 'right'
                      },
                      {
                          field: 'total',
                          display_name: 'Weekly Total',
                          text_align: 'right'
                      }
                    ],
                    collection: velocity_collection
                });
                
                this.$el.append($('<div>', { 'class': 'span6' }).append(velocity_table.$el));
                
                velocity_collection.fetch();
                break;
            }
        }
      
        return this.$el;
    }
});
