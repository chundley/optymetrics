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
            case 'adoption': {
                this.renderAdoptionSubsection();
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
        var datePickerView = new Opty.DateRangeView({defaultDays: 42});
        
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
        var datePickerView = new Opty.DateRangeView({defaultDays: 42});
        
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
        var datePickerView = new Opty.DateRangeView({defaultDays: 42});
        
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
                          return date.getUTCFullYear() + '-' + Opty.util.padNumber(date.getUTCMonth() + 1, 2) + 
                              '-' + Opty.util.padNumber(date.getUTCDate(), 2); 
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
        window.customerHistoryChart = null;
        window.featureUsageChart = null;        

        
        el = this.$el;
        var weeklyCustomerUsageBySku = new Opty.WeeklyCustomerUsageBySku({});
        var week_count = 0;
        window.series_array = [];
        var week_dates = {}; 
        var xAxisLabels = [];
        weeklyCustomerUsageBySku.fetch({success:function(data){
            _.each(data.models, function (model) {
                week_dates[(new Date(model.get("weekOf"))).addHours(9).toString("yyyy-MM-dd")]=0;
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
                    series[model.get('sku')].data[week_dates[(new Date(model.get("weekOf"))).addHours(9).toString("yyyy-MM-dd")]] = model.get(valueName);
                });
    
                series['Free Trial'].visible = false;
                for(var k in series)
                    if(series[k] != null)
                        series_array[valueName].push(series[k]);
            }

            customerHistoryChart = new Opty.SalesChart({ id:'customers-by-sku', series: series_array["totalDailyVisits"], xAxisLabels:xAxisLabels
                , title:'<b>Visits</b> per week by SKU', yLabel:'Weekly Visits', type: 'area'});
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
            el.append("<div style='clear:both;margin-bottom:30px;'>&nbsp;</div>");
            
            
        }}); // end customer usage data fetch


        var weeklyFeatureUsageStatsCollection = new Opty.WeeklyFeatureUsageStatsCollection({});
        window.featureusage_weeks = {};
        window.featureusage_series = {};
        weeklyFeatureUsageStatsCollection.fetch({success:function(data){
            var featureusage_week_count = 0;
            var xAxisLabels = [];
            _.each(data.models, function (model) {
                if(model.get("weekOf") != null && ((new Date()) - new Date(model.get("weekOf")))/(1000*84000) > 1){
                    featureusage_weeks[model.get("weekOf")]=0;
                    featureusage_series[model.get("feature")] = null;
                }
            });
            featureusage_weeks = Opty.util.objectKeySort(featureusage_weeks);
            for(k in window.featureusage_weeks){
                featureusage_weeks[k] = featureusage_week_count++;
                xAxisLabels.push( k );
            }

            window.featureusage_series_array = {};
            window.featureusage_the_datas = {"uniqueUsers":"Unique Users", "uniqueCustomers":"Unique Customers", "visits":"Total Visits"
                                              , "timeOnFeature":"Time On Feature", "percentUsersUsing":"% Users Using", "percentCustomersUsing":"% Customers Using"
                                                  , "percentUsersUsingExcludeEmail":"% Users Using W/O DailyEmail"
                                                  , "percentCustomersUsingExcludeEmail":"% Customers Using W/O DailyEmail"};
            for(valueName in featureusage_the_datas){
                var series = {};
                for(k in featureusage_series)
                    series[k] = null;
                featureusage_series_array[valueName] = [];
                _.each(data.models, function (model) {
                    if(series[model.get('feature')] == null){
                        series[model.get('feature')] = {name:model.get('feature'), data:[]};
                        for(var i=0;i<featureusage_week_count; i++)
                            series[model.get('feature')].data[i] = 0;
                    }
                    var num_val = model.get(valueName);
                    if(/percent/.test(valueName))
                        num_val = parseFloat((num_val * 100).toFixed(1));
                    else
                        num_val = Math.round(num_val);
                    series[model.get('feature')].data[featureusage_weeks[model.get("weekOf")]] = num_val;
                });
                if(/(ExcludeEmail|timeon)/i.test(valueName))
                    delete series["dailyemail"];
                series['help'].visible = false;
                series['twitter'].visible = false;
                series['links'].visible = false;
                
                for(var k in series)
                    if(series[k] != null)
                        featureusage_series_array[valueName].push(series[k]);
            }

            
            window.featureUsageChart = new Opty.SalesChart({ id:'features-usage-weekly'
                                , series: featureusage_series_array["percentUsersUsingExcludeEmail"]
                                , xAxisLabels:xAxisLabels, title:'<b>% Users Using W/O Email</b> per week'
                                , yLabel:'% Users Using W/O Email', type:'line' });
            window.featureUsageChart.salesChartOptions.xAxis = {"labels":{"rotation":90, "y":40, "x":-4}};
            window.featureUsageChart.salesChartOptions.chart["marginBottom"] = 145;
            var $row2 = $('<div>', { 'class': 'row-fluid'});
            var $divCustomers = $('<div>', { 'class': 'span6' });
            var $divCustomersChart = $('<div>', { 'id':'features-usage-weekly', 'height':'450px' });
            $divCustomers.append($divCustomersChart);
            $row2.append($divCustomers);
            for(valueName in featureusage_the_datas){
                $divCustomers.append(
                    $('<a>', {'class': 'change-metric-item', 'title':valueName}).append(featureusage_the_datas[valueName]).click(function(){
                        window.featureUsageChart.series = featureusage_series_array[this.getAttribute("title")];
                        window.featureUsageChart.title = "<b>" + featureusage_the_datas[this.getAttribute("title")] + "</b> per week";
                        window.featureUsageChart.yLabel = "Weekly " + featureusage_the_datas[this.getAttribute("title")];
                        window.featureUsageChart.render();
                    }).css({border:'2px solid #888', padding:'6px', margin:'5px', display:'block'
                            , float:'left', cursor:'pointer', 'border-radius':'8px', 'background-color':'#eee'})
                    
                );
            }
            el.append($row2);
            $divCustomersChart.append(featureUsageChart.$el);
            featureUsageChart.render();
            el.append("<div style='clear:both;margin-bottom:30px;'>&nbsp;</div>");
            
            
        
        }});
        
    },

    renderAdoptionSubsection: function() {
        // Configure report date range picker
        var $datePickerRow = $('<div>', { 'class': 'row-fluid' });
        var datePickerView = new Opty.DateRangeView({defaultDays: 180});
        
        $datePickerRow.append(datePickerView.$el);
        this.$el.append($datePickerRow);

        var $appMetricsRowHeader = $('<div class="row"><div class="span12"><div class="widget-group-header-container"><div class="widget-group-header"><span>App Metrics</span></div></div></div></div>');
        var $appUsageRow = $('<div>', { 'class': 'row' });
        var $totalSKUDiv = $('<div>', { 'class': 'span4' });
        var $totalSitesDiv = $('<div>', { 'class': 'span4' });
        var $totalUsersDiv = $('<div>', { 'class': 'span4' });

        $appUsageRow.append($totalSKUDiv);
        $appUsageRow.append($totalSitesDiv);
        $appUsageRow.append($totalUsersDiv);

        var $featureUsageRowHeader = $('<div class="row" style="margin-top: 20px;"><div class="span12"><div class="widget-group-header-container"><div class="widget-group-header"><span>Feature Usage</span></div></div></div></div>');
        var $featureUsageRow = $('<div>', { 'class': 'row' });
        var $contactManagerUseDiv = $('<div>', { 'class': 'span4' });
        var $emailManagerUseDiv = $('<div>', { 'class': 'span4' });
        var $landingPagesUseDiv = $('<div>', { 'class': 'span4' });

        $featureUsageRow.append($contactManagerUseDiv);
        $featureUsageRow.append($emailManagerUseDiv);
        $featureUsageRow.append($landingPagesUseDiv);

        var $stickinessRowHeader = $('<div class="row" style="margin-top: 20px;"><div class="span12"><div class="widget-group-header-container"><div class="widget-group-header"><span>Stickiness</span></div></div></div></div>');
        var $stickinessRow = $('<div>', { 'class': 'row' });
        var $contactsCreatedDiv = $('<div>', { 'class': 'span4' });
        var $emailSendsDiv = $('<div>', { 'class': 'span4' });
        var $landingPagesPublishedDiv = $('<div>', { 'class': 'span4' });

        $stickinessRow.append($contactsCreatedDiv);
        $stickinessRow.append($emailSendsDiv);
        $stickinessRow.append($landingPagesPublishedDiv);

        // first row of charts
        var adoptionTrendTotalSKUCollection = new Opty.AdoptionByMetricCollection({metric: 'Global-Summary-paying customers'});
        var adoptionTrendTotalSKUChart = new Opty.AdoptionMetricChart({id: 'adoption-paying-customers'}, {collection: adoptionTrendTotalSKUCollection, title:'Total SKU Count', color: '#FA6900'});
        $totalSKUDiv.append(adoptionTrendTotalSKUChart.$el);

        
        var adoptionTrendTotalSitesCollection = new Opty.AdoptionByMetricCollection({metric: 'Global-Traffic-sites with traffic'});
        var adoptionTrendTotalSitesChart = new Opty.AdoptionMetricChart({id: 'adoption-sites'}, {collection: adoptionTrendTotalSitesCollection, title:'Total Sites Tracked', color: '#FA6900'});
        $totalSitesDiv.append(adoptionTrendTotalSitesChart.$el);

        var adoptionTrendTotalUsersCollection = new Opty.AdoptionByMetricCollection({metric: 'Global-Users-active dashboard users'});
        var adoptionTrendTotalUsersChart = new Opty.AdoptionMetricChart({id: 'adoption-users'}, {collection: adoptionTrendTotalUsersCollection, title:'Unique Users Logging In', color: '#FA6900'});
        $totalUsersDiv.append(adoptionTrendTotalUsersChart.$el);


        // second row of charts
        var adoptionTrendContactManagerUseCollection = new Opty.AdoptionByMetricCollection({metric: 'Nurture Demand-Contact Manager-contact app visits'});
        var adoptionTrendContactManagerUseChart = new Opty.AdoptionMetricChart({id: 'adoption-contact-usage'}, {collection: adoptionTrendContactManagerUseCollection, title:'Contact Manager', color: '#3e8bbc'});
        $contactManagerUseDiv.append(adoptionTrendContactManagerUseChart.$el);

        var adoptionTrendEmailManagerUseCollection = new Opty.AdoptionByMetricCollection({metric: 'Nurture Demand-Email Manager-email app visits'});
        var adoptionTrendEmailManagerUseChart = new Opty.AdoptionMetricChart({id: 'adoption-email-usage'}, {collection: adoptionTrendEmailManagerUseCollection, title:'Email Manager', color: '#3e8bbc'});
        $emailManagerUseDiv.append(adoptionTrendEmailManagerUseChart.$el);

        var adoptionTrendLandingPagesUseCollection = new Opty.AdoptionByMetricCollection({metric: 'Nurture Demand-Landing Pages-landing page app visits'});
        var adoptionTrendLandingPagesUseChart = new Opty.AdoptionMetricChart({id: 'adoption-landingpage-usage'}, {collection: adoptionTrendLandingPagesUseCollection, title:'Landing Pages', color: '#3e8bbc'});
        $landingPagesUseDiv.append(adoptionTrendLandingPagesUseChart.$el);


        // third row of charts
        var adoptionTrendContactsCreatedCollection = new Opty.AdoptionByMetricCollection({metric: 'Nurture Demand-Contact Manager-contacts created'});
        var adoptionTrendContactsCreatedChart = new Opty.AdoptionMetricChart({id: 'adoption-contacts-created'}, {collection: adoptionTrendContactsCreatedCollection, title:'Contacts Created', color: '#7AB317'});
        $contactsCreatedDiv.append(adoptionTrendContactsCreatedChart.$el);


        var adoptionTrendEmailsSentCollection = new Opty.AdoptionByMetricCollection({metric: 'Nurture Demand-Email Manager-bulk email sends'});
        var adoptionTrendEmailsSentChart = new Opty.AdoptionMetricChart({id: 'adoption-email-sent'}, {collection: adoptionTrendEmailsSentCollection, title:'Email Bulk Sends', color: '#7AB317'});
        $emailSendsDiv.append(adoptionTrendEmailsSentChart.$el);

        var adoptionTrendLandingPagesPublishedCollection = new Opty.AdoptionByMetricCollection({metric: 'Nurture Demand-Landing Pages-landing pages published'});
        var adoptionTrendLandingPagesPublishedChart = new Opty.AdoptionMetricChart({id: 'adoption-landingpage-publish'}, {collection: adoptionTrendLandingPagesPublishedCollection, title:'Landing Pages Published', color: '#7AB317'});
        $landingPagesPublishedDiv.append(adoptionTrendLandingPagesPublishedChart.$el);


        this.$el.append($appMetricsRowHeader);
        this.$el.append($appUsageRow);

        this.$el.append($featureUsageRowHeader);
        this.$el.append($featureUsageRow);

        this.$el.append($stickinessRowHeader);
        this.$el.append($stickinessRow);

        datePickerView.render();
    }
});
