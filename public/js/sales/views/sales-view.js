if(!window.Opty) { window.Opty = {}; }

Opty.SalesView = Backbone.View.extend({
    id: 'sales-view',

    initialize: function (options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render', 'renderCustomers');
    },

    render: function () {
        switch (this.options.selected) {
            case 'price':
                {
                    var me = this;
                    var $row = $('<div>', { 'class': 'row' });
                    var $calcdiv = $('<div>', { 'class': 'span12' });


                    var calc = new Opty.SalesCalcView();

                    me.$el.append($row);
                    $row.append($calcdiv);
                    $calcdiv.append(calc.render());
                    break;
                }
            case 'customers':
                {
                    this.renderCustomers();
                    break;
                }
            case 'mrr':
            default:
                {
                    this.renderMRR();
                    break;
                }
        }
        return this.$el;
    },

    renderMRR: function () {
        var me = this;

        // Unbind all reportrange:changed listeners. TODO: More robust view cleanup
        Opty.pubsub.unbind('reportrange:changed');

        // Configure report date range picker
        var $datePickerRow = $('<div>', { 'class': 'row' });
        //var datePickerView = new Opty.DateRangeView({ defaultDays: 366 });
        var datePickerView = new Opty.DateRangeView({ start: 'Tue July 31 2012 00:00:00 GMT-0700 (Pacific Daylight Time)', end: 'Wed Jul 31 2013 23:59:59 GMT-0700 (Pacific Daylight Time)' });
        $datePickerRow.append(datePickerView.$el);
        me.$el.append($datePickerRow);

        var mrrHistoryCollection = new Opty.MRRHistoryCollection({});

        var mrrByProductCollection = new Opty.MRRByProductCollection({});
        var mrrSoftwareBySKUCollection = new Opty.MRRSoftwareBySKUCollection({});

        var churnByProductCollection = new Opty.ChurnByProductCollection({});
        var newsalesByProductCollection = new Opty.NewSalesByProductCollection({});

        var $row1 = $('<div>', { 'class': 'row-fluid' });
        var $row2 = $('<div>', { 'class': 'row-fluid', 'style': 'padding-top: 8px;' });
        var $divMRRRollupChart = $('<div>', { 'class': 'span6' });
        var $divSKURollupChart = $('<div>', { 'class': 'span6' });

        var $divChurnRollupChart = $('<div>', { 'class': 'span6' });

        me.$el.append($row1);
        me.$el.append($row2);

        $row1.append($divMRRRollupChart);
        $row1.append($divSKURollupChart);

        $row2.append($divChurnRollupChart);

        var mrrRollupView = new Opty.MRRRollupChart({ collection: mrrByProductCollection });
        var mrrSKURollupView = new Opty.MRRSKUChart({ collection: mrrSoftwareBySKUCollection });
        var churnRollupView = new Opty.ChurnRollupChart({ churn: churnByProductCollection, newsales: newsalesByProductCollection});
        
        $divMRRRollupChart.append(mrrRollupView.$el);
        $divSKURollupChart.append(mrrSKURollupView.$el);
        $divChurnRollupChart.append(churnRollupView.$el);

        datePickerView.render();
    },
    renderCustomers: function () {
        el = this.$el;
        var customerHistoryCollection = new Opty.CustomerHistoryCollection({});
        var series = {};
        var series_array = [];
        var startDate = new Date('Mon Jan 2 2012 00:00:00 GMT-0700 (Pacific Daylight Time)').moveToFirstDayOfMonth();
        var endDate = new Date('Sat Aug 31 2013 23:59:59 GMT-0700 (Pacific Daylight Time)');

        start_date = Date.today().add(-17).months().moveToFirstDayOfMonth();
        var dates = {};
        date_num = 0;
        var xAxisLabels = [];
        while (startDate < endDate) {
            dates[startDate.toString("yyyy-MM-dd")] = date_num++;
            xAxisLabels.push(startDate.toString("MMM") + " " + (startDate.getMonth() == 0 || date_num == 1 ? startDate.toString("yyyy") : ""));
            startDate = startDate.add(1).months();
        }
        series["Free Trial"] = null;
        series["Premium"] = null;
        series["Express"] = null;
        series["Basic"] = null;
        series["Agency"] = null;
        series["Professional"] = null;
        series["Enterprise"] = null;
        customerHistoryCollection.fetch({ success: function (data) {
            _.each(data.models, function (model) {
                if (series[model.get('sku')] == null) {
                    series[model.get('sku')] = { name: model.get('sku'), data: [] };
                    for (var i = 0; i < date_num; i++)
                        series[model.get('sku')].data[i] = 0;
                }
                series[model.get('sku')].data[dates[model.get("monthOf").substring(0, 10)]] = model.get('customerCount');
            });
            series['Free Trial'].visible = false;
            window.sales_series_array = [];
            for (var k in series)
                window.sales_series_array.push(series[k]);
            window.customerHistoryChart = new Opty.SalesChart({ id: 'customers-by-sku', series: sales_series_array, xAxisLabels: xAxisLabels, title: 'Customers by SKU', yLabel: 'Customer Count', type: 'area' });

            var $row1 = $('<div>', { 'class': 'row-fluid' });
            var $divCustomers = $('<div>', { 'class': 'span6', 'id': 'customers-by-sku', 'height': '450px' });
            el.append($row1);
            $row1.append($divCustomers);
            $divCustomers.append(customerHistoryChart.$el);
            customerHistoryChart.render();
        }
        });
    }

});
