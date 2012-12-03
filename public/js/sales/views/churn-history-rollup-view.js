if (!window.Opty) { window.Opty = {}; }

/**
* MRR rollup chart view
*/
Opty.ChurnRollupChart = Backbone.View.extend({
    id: 'churn-rollup-chart',
    churnRollupChartOptions: {
        colors: ["#3e8bbc", "#FA6900", "#5B4086", "#002066", "#7AB317", "#F2DB13", "#FE4365", "#EF3F00", "#C5BC8E", "#3D1C00"],
        chart: {
            renderTo: 'churn-rollup-chart',
            borderColor: '#999999',
            borderWidth: 1,
            borderRadius: 6,
            backgroundColor: {
                linearGradient: [0, 0, 0, 300],
                stops: [
                    [0, '#363636'],
                    [1, '#191919']
                ]
            }
        },
        title: {
            text: 'MRR Churn vs. New Business',
            style: {
                color: '#e3e3e3'
            }
        },
        legend: {
            verticalAlign: 'bottom',
            layout: 'horizontal',
            backgroundColor: '#191919',
            borderColor: '#999999',
            borderWidth: 1,
            itemStyle: {
                fontSize: '12px',
                color: '#999999'
            }
        },
        xAxis: {
            gridLineColor: '#444444',
            gridLineWidth: 1,
            labels: {
                style: {
                    color: '#999999'
                }
            }
        },
        yAxis: [{
            gridLineColor: '#444444',
            title: {
                text: null,
                style: {
                    color: '#e3e3e3',
                    fontSize: '13px',
                    fontWeight: 'normal'
                }
            },
            min: 0,
            startOnTick: true,
            showFirstLabel: false,
            labels: {
                formatter: function () {
                    return '$' + Highcharts.numberFormat(this.value, 0);
                },
                style: {
                    color: '#999999'
                }
            }
        }],
        tooltip: {
            shared: false,
            formatter: function () {
                return this.series.name + '<br>' + this.x + '<br>$' + Highcharts.numberFormat(this.y, 0);
            }
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                marker: {
                    enabled: true
                },
                borderColor: '#999999'
            },
            series: {
                point: {
                    events: {
                        click: function() {
                            // hack through the data set to find values to make another service call
                            var type = this.series.name.split(' ')[0];
                            var productType = this.series.name.split(' ')[1];

                            // silly, but needed for browser compatibility
                            var formatDate = function(date, callback) {
                                var month = date.split('-')[0];
                                var year = date.split('-')[1];
                                var numMonth = 0;
                                var numDay = 0;
                                switch(month) {
                                    case 'Jan': numMonth = 0; numDay = 31; break;
                                    case 'Feb': numMonth = 1; numDay = (year == 2012 || year == 2016) ? 29: 28; break;
                                    case 'Mar': numMonth = 2; numDay = 31; break;
                                    case 'Apr': numMonth = 3; numDay = 30; break;
                                    case 'May': numMonth = 4; numDay = 31; break;
                                    case 'Jun': numMonth = 5; numDay = 30; break;
                                    case 'Jul': numMonth = 6; numDay = 31; break;
                                    case 'Aug': numMonth = 7; numDay = 31; break;
                                    case 'Sep': numMonth = 8; numDay = 30; break;
                                    case 'Oct': numMonth = 9; numDay = 31; break;
                                    case 'Nov': numMonth = 10; numDay = 30; break;
                                    case 'Dec': numMonth = 11; numDay = 31; break;
                                }
                                var ret = new Date(year, numMonth, numDay);
                                callback(ret);
                            }

                            var startDate = null;
                            formatDate(this.category, function(formattedDate) {
                                startDate = new Date(formattedDate);
                            });

                            var endDate = new Date(startDate);
                            endDate.setDate(startDate.getDate() + 31);
                            var query = '/rest/sales/'
                            if (type == 'New') {
                                query += 'new-detail';
                            }
                            else {
                                query += 'churn-detail';
                            }
                            query += '?start=' + 
                                (startDate.getTime()).toString() +
                                '&end=' +
                                (endDate.getTime()).toString() +
                                '&type=' +
                                productType;

                            // need async function call to resolve data before the popup renders
                            var customers = '<table width="100%" cellpadding="0" cellspacing="0" border="0">';
                            var getDetail = function(callback) {
                                $.getJSON(query, function(result) {
                                    var total = 0;
                                    $.each(result, function(i) {
                                        customers += '<tr><td>' + this.accountName + '</td><td>' + this.sku.toLowerCase() + '</td><td align="right">$' + Highcharts.numberFormat(this.totalPrice, 0) + '</td></tr>';
                                        total += this.totalPrice;
                                    });
                                    customers += '<tr style="font-size: 120%; font-weight: bold; color: #dddddd;"><td><b>Total</b></td><td colspan="2" align="right"><b>$' + Highcharts.numberFormat(total, 0) + '</td></tr>';
                                    customers += '</table>';
                                    callback(customers);
                                });                                
                            }

                            var me = this;
                            getDetail(function(results) {
                                hs.htmlExpand(null, {
                                    pageOrigin: {
                                        x: me.pageX,
                                        y: me.pageY
                                    },
                                    headingText: me.series.name + ' ' + me.category,
                                    maincontentText: results,
                                    width: 450
                                });                                
                            });
                        }
                    }
                }
            }
        },
        series: [
        {
            color: {
                linearGradient: [0, 0, 0, 1000],
                stops: [
                    [0, "#941919"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'column',
            name: 'Churn Software',
            stack: 'churn'
        },
        {
            color: {
                linearGradient: [0, 0, 0, 1000],
                stops: [
                    [0, "#af521f"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'column',
            name: 'Churn Services',
            stack: 'churn'
        },
        {
            color: {
                linearGradient: [0, 0, 0, 1000],
                stops: [
                    [0, "#325a1f"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'column',
            name: 'New Software',
            stack: 'new'
        },
        {
            color: {
                linearGradient: [0, 0, 0, 1000],
                stops: [
                    [0, "#026659"],
                    [1, 'rgba(0,0,0,0)']
                ]
            },
            type: 'column',
            name: 'New Services',
            stack: 'new'
        }        
        ],
        credits: {
            enabled: false
        }
    },

    initialize: function (options) {
        var me = this;

        _.bindAll(me, 'render', 'churnRollupDataChanged');

        me.churn = options.churn;
        me.newsales = options.newsales;

        me.churn.on('reset', me.churnRollupDataChanged);
        me.newsales.on('reset', me.churnRollupDataChanged);
    },

    churnRollupDataChanged: function () {
        this.render();
    },

    render: function () {
        var me = this;
        this.$el.empty();

        var categories = [];
        var softwareChurn = [];
        var servicesChurn = [];
        var softwareNew = [];
        var servicesNew = [];

        // bunch of code to get unique dates between the two data sets and format them correctly
        var catTemp = [];
        this.newsales.each(function(model) {
            catTemp.push(model.get('dateAdded'));
        });

        this.churn.each(function(model) {
            catTemp.push(model.get('dateAdded'));
        });

        // dedup
        categories = catTemp.filter(function(elem, pos) {
            return catTemp.indexOf(elem) == pos;
        });
        
        // sort (they can be out of order after dedup)
        categories.sort();

        // format correctly
        for (var i=0; i<categories.length; i++) {
            categories[i] = Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(categories[i])));
        }

        // set arrays of data for chart output
        for (var i=0; i<categories.length; i++) {
            var found = false;
            this.newsales.each(function(model){
                if (Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(model.get('dateAdded')))) == categories[i] ) {
                    // dirty hack - this is our first date and makes everything look like new business
                    if (Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(model.get('dateAdded')))) != 'Dec-2011') {
                        found = true;
                        softwareNew.push(model.get('software'));
                        servicesNew.push(model.get('services'));
                    }
                }
            });
            if (!found) {
                softwareNew.push(0);
                servicesNew.push(0);  
            }
        }

        for (var i=0; i<categories.length; i++) {
            var found = false;
            this.churn.each(function(model){
                if (Highcharts.dateFormat('%b-%Y', me.convertDateToUTC(new Date(model.get('dateAdded')))) == categories[i] ) {
                    found = true;
                    softwareChurn.push(model.get('software'));
                    servicesChurn.push(model.get('services'));                    
                }
            });
            if (!found) {
                softwareChurn.push(0);
                servicesChurn.push(0);  
            }
        }

        this.churnRollupChartOptions.series[0].data = softwareChurn;
        this.churnRollupChartOptions.series[1].data = servicesChurn;
        this.churnRollupChartOptions.series[2].data = softwareNew;
        this.churnRollupChartOptions.series[3].data = servicesNew;

        this.churnRollupChartOptions.xAxis.categories = categories

        this.chart = new Highcharts.Chart(this.churnRollupChartOptions);
        return this.$el;
    },

    convertDateToUTC: function (date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }
}
);
