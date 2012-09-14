if(!window.Opty) { window.Opty = {}; }

/**
 * Development budget allocated by feature group
 */
Opty.FeatureGroupChartView = Backbone.View.extend({
    id: 'feature-group-chart',
    className: 'widget-white',
    chartOptions: {
        chart: {
            renderTo: 'feature-group-chart',
            type: 'pie',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            marginBottom: 70
        },
        title: {
            text: 'Points allocated by Feature Group (Deployed)'
        },
        tooltip: {
            formatter: function() {
                return '<b>' + this.point.name + '</b>: ' + this.y + '%'; 
            },
            positioner: function () {
               return { x: ((this.chart.plotSizeX / 2) - (this.label.width / 2) + 20), y: 550 };
            },
            style: {
                fontSize: '18px'
            },
            borderWidth: 0,
            shadow: false
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            if(this.series.name === 'FeatureGroups') { 
                                Opty.pubsub.trigger('featuregroup:changed', this.name);
                            }
                        }
                    }
                },
                stickyTracking: true
            }
        },
        series: [],
        credits: {
            enabled: false
        }
    },

    epics: [
        [ 'Adoption', 'Dashboard' ],
        [ 'Adoption', 'Onboarding' ],
        [ 'Adoption', 'Settings' ],
        [ 'Adoption', 'UI Polish' ],
        [ 'Billing', 'SKU Packaging' ],
        [ 'Inbound Marketing', 'Landing Pages' ],
        [ 'Inbound Marketing', 'Lead Intelligence' ],
        [ 'Inbound Marketing', 'Pages' ],
        [ 'Inbound Marketing', 'Reporting' ],
        [ 'Infrastructure', 'Engineering' ],
        [ 'Infrastructure', 'Engineering Excellence' ],
        [ 'Infrastructure', 'Infrastructure' ],
        [ 'Marketing Automation', 'Contact Manager' ],
        [ 'Marketing Automation', 'CRM' ],
        [ 'Marketing Automation', 'Email Manager' ],
        [ 'Miscellaneous', 'Miscellaneous' ]
    ],

    getEpicForFeatureGroup: function(featureGroup) {
        var result = 'Unknown';
        _.any(this.epics, function(epic) {
            if(epic[1] === featureGroup) {
                result = epic[0];
                return true;
            }

            return false;
        });

        return result;
    },

    initialize: function(options) {
        var me = this;

        _.bindAll(me, 'render', 'chartDataChanged');

        me.collection = options.collection;
        me.collection.on('reset', me.chartDataChanged);
    },

    chartDataChanged: function() {
        this.render();
    },

    render: function() {
        var me = this;
        this.$el.empty();

        var data = [],
            epics = {},
            categories = [],
            total = 0,
            colors = Highcharts.getOptions().colors;
       
        me.collection.each(function(model) {
            total += model.get('size');
        });

        // Group feature group rollups by epic
        me.collection.each(function(model) {
            var fg = model.get('featureGroup'); 
            var epic = me.getEpicForFeatureGroup(fg);
            if(epics[epic]) {
                epics[epic].push([ fg, Math.round((model.get('size') / total) * 100) ]);    
            } else {
                epics[epic] = [ [ fg, Math.round((model.get('size') / total) * 100) ] ];
            }
        });

        // Format data for Highcharts 
        var i = 0;
        for(epic in epics) {
            categories.push(epic);
            var y = 0;
            var categoriesInner = [];
            var categoryData = [];
            
            _.each(epics[epic], function(fg) {
                y += fg[1];
                categoriesInner.push(fg[0]);
                categoryData.push(fg[1]);
            });
            
            data.push({
                y: y,
                color: colors[i],
                drilldown: {
                    categories: categoriesInner,
                    data: categoryData,
                    color: colors[i]
                }
            });
           
            i++;
        };

        var epicData = [];
        var fgData = [];

        for(var i = 0; i < data.length; i++) {
            epicData.push({
                name: categories[i],
                y: data[i].y,
                color: data[i].color
            });

            for(var j = 0; j < data[i].drilldown.data.length; j++) {
                var brightness = 0.2 - (j / data[i].drilldown.data.length) / 5;
                fgData.push({
                    name: data[i].drilldown.categories[j],
                    y: data[i].drilldown.data[j],
                    color: Highcharts.Color(data[i].color).brighten(brightness).get()
                });
            }
        }
        
        me.chartOptions.series = [];
        me.chartOptions.series.push({
            name: 'Epics',
            data: epicData,
            size: '60%',
            dataLabels: {
                formatter: function() {
                    return this.y > 5 ? this.point.name : null;
                },
                color: 'white',
                distance: -65
            },
            allowPointSelect: false
        });

        me.chartOptions.series.push({
            name: 'FeatureGroups',
            data: fgData,
            innerSize: '60%',
            dataLabels: {
                formatter: function() {
                    // display only if larger than 1
                    return this.y > 1 ? '<b>' + this.point.name + ':</b>' + this.y + '%': null;
                }
            }
        });
        
        this.chart = new Highcharts.Chart(this.chartOptions);

        return this.$el;
    }
});
