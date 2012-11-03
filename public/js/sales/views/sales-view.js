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
                    console.log(calc.render())
                    $calcdiv.append(calc.render());
                    break;
                }
            case 'customers':
            default:
                {
                    this.renderCustomers();
                    break;
                }
        }
        return this.$el;
    },

    renderCustomers: function () {
        el = this.$el;
        var customerHistoryCollection = new Opty.CustomerHistoryCollection({});
        var series = {};
        var series_array = [];
        start_date = Date.today().add(-17).months().moveToFirstDayOfMonth();
        var dates = {};
        date_num = 0;
        var xAxisLabels = [];
        while (start_date < Date.today()) {
            dates[start_date.toString("yyyy-MM-dd")] = date_num++;
            xAxisLabels.push(start_date.toString("MMM") + " " + (start_date.getMonth() == 0 || date_num == 1 ? start_date.toString("yyyy") : ""));
            start_date = start_date.add(1).months();
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
