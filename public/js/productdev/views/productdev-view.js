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
        var $velocityHeaderRow = $('<div>', { 'class': 'row-fluid' }).append($('<p>', { 'class': 'lead' }).append('Velocity'));
        var $velocityChartColumn = $('<div>', { 'class': 'span6' });
        var $velocityTableColumn = $('<div>', { 'class': 'span6' });
        this.$el.append($velocityHeaderRow);
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
    
        // Cycle time table
        var $cycleTimeRow = $('<div>', { 'class': 'row-fluid report-section' });
        var $cycleTimeTableColumn = $('<div>', { 'class': 'span6' });
        var $cycleTimeHeaderRow = $('<div>', { 'class': 'row-fluid' }).append($('<p>', { 'class': 'lead' }).append('Cycle Time'));
        var $cycleTimeRow = $('<div>', { 'class': 'row-fluid report-section' });
        $cycleTimeRow.append($cycleTimeTableColumn);
        this.$el.append($cycleTimeHeaderRow);
        this.$el.append($cycleTimeRow);

        var cycleTimeCollection = new Opty.CycleTimeCollection({});
        
        var cycleTimeTable = new Opty.TableView({
            table_fields: [
              {
                  field: 'size',
                  display_name: 'Size (Pts)',
                  text_align: 'right'
              },
              {
                  field: 'cycleTimeDays',
                  display_name: 'Cycle Time (Days)',
                  text_align: 'right'
              }
            ],
            collection: cycleTimeCollection,
            sortable: true,
            defaultSort: [[0,0]]
        });
        
        $cycleTimeTableColumn.append(cycleTimeTable.$el);

        // Render the date picker last as it is the main driver of events impacting
        // data fetch
        datePickerView.render();
    },
    
    renderUsageSubsection: function() {
        el = this.$el;
        var weeklyCustomerUsageBySku = new Opty.WeeklyCustomerUsageBySku({});
        var week_count = 0;
        window.series_array = [];
        var week_dates = {}; 
        var xAxisLabels = [];
        window.customerHistoryChart = null;
        
        weeklyCustomerUsageBySku.fetch({success:function(data){
            _.each(data.models, function (model) {
                week_dates[Opty.util.getSundayDate(new Date(model.get("weekOf"))).toString("yyyy-MM-dd")]=0;
            });
            week_dates = Opty.util.objectKeySort(week_dates);
            for(k in week_dates){
                week_dates[k] = week_count;
                xAxisLabels.push( k );
                week_count++;
            }
            
            series_array = {};
            window.the_datas = {"totalDailyVisits":"Visits", "userCount":"Unique Users", "customerCount":"Unique Customers"};
            for(valueName in the_datas){
                var series = {};
                series["Free Trial"] = null;
                series["Premium"] = null;
                series["Express"] = null;
                series["Basic"] = null;
                series["Agency"] = null;
                series["Professional"] = null;
                series["Enterprise"] = null;
                series_array[valueName] = [];
                _.each(data.models, function (model) {
                    if(series[model.get('sku')] == null){
                        series[model.get('sku')] = {name:model.get('sku'), data:[]};
                        for(var i=0;i<week_count; i++)
                            series[model.get('sku')].data[i] = 0;
                    }
                    series[model.get('sku')].data[week_dates[Opty.util.getSundayDate(new Date(model.get("weekOf"))).toString("yyyy-MM-dd")]] = model.get(valueName);
                });
    
                series['Free Trial'].visible = false;
                for(var k in series)
                    if(series[k] != null)
                        series_array[valueName].push(series[k]);
            }
            customerHistoryChart = new Opty.SalesChart({ id:'customers-by-sku', series: series_array["totalDailyVisits"], xAxisLabels:xAxisLabels, title:'<b>Visits</b> per week by SKU', yLabel:'Weekly Visits' });
            customerHistoryChart.salesChartOptions.xAxis = {"labels":{"rotation":90, "y":40, "x":-4}};
            customerHistoryChart.salesChartOptions.chart["marginBottom"] = 130;
            var $row1 = $('<div>', { 'class': 'row-fluid'});
            var $divCustomers = $('<div>', { 'class': 'span6' });
            var $divCustomersChart = $('<div>', { 'id':'customers-by-sku', 'height':'450px' });
            $divCustomers.append($divCustomersChart);
            $row1.append($divCustomers);
            for(valueName in the_datas){
                $divCustomers.append(
                    $('<a>', {'class': 'change-metric-item', 'title':valueName}).append(the_datas[valueName]).click(function(){
                        window.customerHistoryChart.series = window.series_array[this.getAttribute("title")];
                        window.customerHistoryChart.title = "<b>" + window.the_datas[this.getAttribute("title")] + "</b> per week by SKU";
                        window.customerHistoryChart.yLabel = "Weekly " + window.the_datas[this.getAttribute("title")];
                        window.customerHistoryChart.render();
                    }).css({border:'2px solid #888', padding:'6px', margin:'5px', display:'block', float:'left', cursor:'pointer', 'border-radius':'8px', 'background-color':'#eee'})
                    
                );
            }
            
            el.append($row1);
            $divCustomersChart.append(customerHistoryChart.$el);
            customerHistoryChart.render();
            
            
        }}); // end customer usage data fetch

        var weeklyFeatureUsageStatsCollection = new Opty.WeeklyFeatureUsageStatsCollection({});
        weeklyFeatureUsageStatsCollection.fetch({success:function(data){
        }});
        
/*        
        var week_count = 0;
        window.series_array = [];
        var week_dates = {}; 
        var xAxisLabels = [];
        window.customerHistoryChart = null;

 */       

    }
});
