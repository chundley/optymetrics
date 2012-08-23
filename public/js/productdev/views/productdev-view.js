if(!window.Opty) { window.Opty = {}; }

Opty.ProductDevView = Backbone.View.extend({
    id: 'productdev-view',

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
            case 'sprint-metrics': {
                // Define basic top-level view infrastructure
                var $velocityRow = $('<div>', { 'class': 'row-fluid' });
                var $velocityChartColumn = $('<div>', { 'class': 'span6' });
                var $velocityTableColumn = $('<div>', { 'class': 'span6' });
                this.$el.append($velocityRow);
                $velocityRow.append($velocityChartColumn);
                $velocityRow.append($velocityTableColumn);

                var velocityCollection = new Opty.VelocityCollection();
                
                // Chart view 
                var velocityChart = new Opty.VelocityChart({ collection: velocityCollection }); 
                $velocityChartColumn.append(velocityChart.$el);
                
                var velocityTable = new opty.TableView({
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
                    collection: velocityCollection,
                    sortable: true
                });
               
                $velocityTableColumn.append(velocityTable.$el);
                
                velocityCollection.fetch();
                break;
            }
            default: {
                this.$el.append('TODO');
                break;
            }
        }
      
        return this.$el;
    }
});
