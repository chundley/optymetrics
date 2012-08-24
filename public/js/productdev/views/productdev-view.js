if(!window.Opty) { window.Opty = {}; }

Opty.ProductDevView = Backbone.View.extend({
    id: 'productdev-view',

    initialize: function(options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render');
    },

    render: function() {
        // Unbind all reportrange:changed listeners. TODO: More robust view cleanup
        Opty.pubsub.unbind('reportrange:changed');
        switch(this.options.selected) {
            case 'bug-metrics': {
                break;
            }
            case 'sprint-metrics': {
                // Configure report date range picker
                var $datePickerRow = $('<div>', { 'class': 'row-fluid' });
                var datePickerView = new Opty.DateRangeView({});
                
                $datePickerRow.append(datePickerView.$el);
                this.$el.append($datePickerRow);

                var velocityCollection = new Opty.VelocityCollection();
                var featureGroupCollection = new Opty.FeatureGroupCollection({});
                
                // Define basic top-level view infrastructure
                var $velocityRow = $('<div>', { 'class': 'row-fluid' });
                var $velocityChartColumn = $('<div>', { 'class': 'span6' });
                var $velocityTableColumn = $('<div>', { 'class': 'span6' });
                this.$el.append($velocityRow);
                $velocityRow.append($velocityChartColumn);
                $velocityRow.append($velocityTableColumn);

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
                                  return date.getFullYear() + '-' + opty.util.padNumber(date.getMonth() + 1, 2) + 
                                      '-' + opty.util.padNumber(date.getDate(), 2); 
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
                    sortable: true,
                    defaultSort: [[0,0]]
                });
               
                $velocityTableColumn.append(velocityTable.$el);
                
                //velocityCollection.fetch();

                // Feature group section
                var $featureGroupRow = $('<div>', { 'class': 'row-fluid' });
                var $featureGroupTableColumn = $('<div>', { 'class': 'span6' });
                var $featureGroupChartColumn = $('<div>', { 'class': 'span6' });
                this.$el.append($featureGroupRow);
                $featureGroupRow.append($featureGroupChartColumn);
                $featureGroupRow.append($featureGroupTableColumn);
               

                var featureGroupChart = new Opty.FeatureGroupChartView({ collection: featureGroupCollection });
                $featureGroupChartColumn.append(featureGroupChart.$el);

                //featureGroupCollection.fetch();

                // Render the date picker last as it is the main driver of events impacted data fetch
                datePickerView.render();
                
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
