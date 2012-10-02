if(!window.Opty) { window.Opty = {}; }

Opty.ProductDevView = Backbone.View.extend({
    id: 'productdev-view',

    initialize: function(options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render', 'renderOverview', 'renderFeatureGroupSubsection', 'renderVelocitySubsection', 'renderUsageSubsection');
    },

    render: function() {
        // Unbind all reportrange:changed listeners. TODO: More robust view cleanup
        Opty.pubsub.unbind('reportrange:changed');

        switch(this.options.selected) {
            case 'velocity': {
                this.renderVelocitySubsection();
                break;
            }
            case 'feature-groups': {
                this.renderFeatureGroupSubsection();
                break;
            }
            case 'usage': {
                this.renderUsageSubsection();
                break;
            }
            default: {
                this.renderOverview(); 
                break;
            }
        }
        
        return this.$el;
    },

    renderOverview: function() {
        // Configure report date range picker
        var $datePickerRow = $('<div>', { 'class': 'row-fluid' });
        var datePickerView = new Opty.DateRangeView({defaultDays: 30});
        
        $datePickerRow.append(datePickerView.$el);
        this.$el.append($datePickerRow);

        var velocityTrendCollection = new Opty.VelocityTrendCollection({});

        // Define basic top-level view infrastructure
        var $velocityTrendRow = $('<div>' , { 'class': 'row-fluid report-section' });
        var $velocityTrendColumn = $('<div>', { 'class': 'span6' });
        $velocityTrendRow.append($velocityTrendColumn);
        this.$el.append($velocityTrendRow);

        // Velocity trend
        var velocityTrendWidgetView = new Opty.VelocityTrendWidgetView({
            collection: velocityTrendCollection,
            title: 'Velocity Trend',
            goal: 35
        });
        $velocityTrendColumn.append(velocityTrendWidgetView.$el);
        
        // Render the date picker last as it is the main driver of events impacting
        // data fetch
        datePickerView.render();
    },

    renderFeatureGroupSubsection: function() {
        // Configure report date range picker
        var $datePickerRow = $('<div>', { 'class': 'row-fluid' });
        var datePickerView = new Opty.DateRangeView({defaultDays: 30});
        
        $datePickerRow.append(datePickerView.$el);
        this.$el.append($datePickerRow);

        var featureGroupCollection = new Opty.FeatureGroupCollection({});
        
        // Feature group section
        var $featureGroupRow = $('<div>', { 'class': 'row-fluid report-section' });
        var $featureGroupChartColumn = $('<div>', { 'class': 'span12' });
        this.$el.append($featureGroupRow);
        $featureGroupRow.append($featureGroupChartColumn);

        var featureGroupChart = new Opty.FeatureGroupChartView({ collection: featureGroupCollection });
        $featureGroupChartColumn.append(featureGroupChart.$el);

        
        var $featureGroupDrillDownRow = $('<div>', { 'class': 'row-fluid report-section' });
        this.$el.append($featureGroupDrillDownRow);
        
        var storyCollection = new Opty.StoryCollection({});

        var featureGroupDrillDownTable = new Opty.TableView({
            id: 'feature-group-table',
            table_fields: [
              {
                  field: 'deployedOn',
                  display_name: 'Deployed',
                  formatter: function(data) {
                      if(data) {
                          var date = new Date(data);
                          return date.getFullYear() + '-' + Opty.util.padNumber(date.getMonth() + 1, 2) + 
                              '-' + Opty.util.padNumber(date.getDate(), 2); 
                      } else {
                          return "";
                      }
                  }
              },
              {
                  field: 'name',
                  display_name: 'Name'
              },
              {
                  field: 'size',
                  display_name: 'Size',
                  text_align: 'right'
              },
              {
                  field: 'labels',
                  display_name: 'Category',
                  formatter: function(data) {
                      var labels = '';
                      _.each(data, function(label) {
                          labels += label.name + ', ';
                      });

                      return labels.replace(/,\s$/, '');
                  }
              },
              {
                  field: 'members',
                  display_name: 'Owners',
                  formatter: function(data) {
                      var owners = '';
                      _.each(data, function(owner) {
                          owners += owner.name + ', ';
                      });

                      return owners.replace(/,\s$/, '');
                  }
              },
              {
                  field: 'featureGroups',
                  display_name: 'Feature Group',
                  formatter: function(data) {
                      if(data && data.length > 0) {
                          return data[0];
                      } else {
                          return '';
                      }
                  },
               }
            ],
            collection: storyCollection,
            sortable: true,
            defaultSort: [[0,0]]
        });
      
        var $featureGroupDrillDownColumn = $('<div>', { 'class': 'span12' });
        $featureGroupDrillDownColumn.append(featureGroupDrillDownTable.$el);
        $featureGroupDrillDownRow.append($featureGroupDrillDownColumn);

        // Render the date picker last as it is the main driver of events impacting
        // data fetch
        datePickerView.render();
    },

    renderVelocitySubsection: function() {
        // Configure report date range picker
        var $datePickerRow = $('<div>', { 'class': 'row-fluid' });
        var datePickerView = new Opty.DateRangeView({defaultDays: 30});
        
        $datePickerRow.append(datePickerView.$el);
        this.$el.append($datePickerRow);

        var velocityCollection = new Opty.VelocityCollection({});

        // Define basic top-level view infrastructure
        var $velocityRow = $('<div>', { 'class': 'row-fluid report-section' });
        var $velocityChartColumn = $('<div>', { 'class': 'span6' });
        var $velocityTableColumn = $('<div>', { 'class': 'span6' });
        this.$el.append($velocityRow);
        $velocityRow.append($velocityChartColumn);
        $velocityRow.append($velocityTableColumn);

        // Chart view 
        var velocityChart = new Opty.VelocityChart({ collection: velocityCollection }); 
        $velocityChartColumn.append(velocityChart.$el);
        
        var velocityTable = new Opty.TableView({
            table_fields: [
              {
                  field: 'week_of',
                  display_name: 'Week Of',
                  formatter: function(data) {
                      if(data) {
                          var date = new Date(data);
                          return date.getFullYear() + '-' + Opty.util.padNumber(date.getMonth() + 1, 2) + 
                              '-' + Opty.util.padNumber(date.getDate(), 2); 
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
        
        // Render the date picker last as it is the main driver of events impacting
        // data fetch
        datePickerView.render();
    },
    
    renderUsageSubsection: function() {
        this.$el.append("Usage");
        
        
        el = this.$el;
        var weeklyCustomerUsageBySku = new Opty.WeeklyCustomerUsageBySku({});
        weeklyCustomerUsageBySku.fetch();
/*        
        var series = {};
        var series_array = [];
        start_date = Date.today().add(-17).months().moveToFirstDayOfMonth();
        var dates = {};
        date_num = 0;
        var xAxisLabels = [];
        while(start_date < Date.today())
        {
            dates[start_date.toString("yyyy-MM-dd")] = date_num++;
            xAxisLabels.push(start_date.toString("MMM") + " " + (start_date.getMonth()==0 || date_num==1?start_date.toString("yyyy"):"") );
            start_date = start_date.add(1).months();
        }
        series["Free Trial"] = null;
        series["Premium"] = null;
        series["Express"] = null;
        series["Basic"] = null;
        series["Agency"] = null;
        series["Professional"] = null;
        series["Enterprise"] = null;
        customerHistoryCollection.fetch({success: function(data) {
                _.each(data.models, function (model) {
                    if(series[model.get('sku')] == null){
                        series[model.get('sku')] = {name:model.get('sku'), data:[]};
                        for(var i=0;i<date_num; i++)
                            series[model.get('sku')].data[i] = 0;
                    }
                    series[model.get('sku')].data[dates[model.get("monthOf").substring(0,10)]] = model.get('customerCount');
                });
                series['Free Trial'].visible = false;
                series_array = [];
                for(var k in series)
                    series_array.push(series[k]);
                var customerHistoryChart = new Opty.SalesChart({ id:'customers-by-sku', series: series_array, xAxisLabels:xAxisLabels, title:'Customers by SKU', yLabel:'Customer Count' });

                var $row1 = $('<div>', { 'class': 'row-fluid'});
                var $divCustomers = $('<div>', { 'class': 'span6', 'id':'customers-by-sku', 'height':'450px' });
                el.append($row1);
                $row1.append($divCustomers);
                $divCustomers.append(customerHistoryChart.$el);
                customerHistoryChart.render();
            }
        });
    }        
        */
    }
});
