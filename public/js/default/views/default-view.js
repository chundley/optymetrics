var opty = opty || {};

opty.DefaultView = Backbone.View.extend({
    id: 'default-view',
    className: 'row-fluid',

    initialize: function (options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render');
    },
    render: function () {
        switch (this.options.selected) {
            default:
                {
                    var that = this;

                    // pre-render divs or the widgets will render in random order
                    var div1 = that.$el.append($('<div>', { 'class': 'span3', 'id': 'div1' }));

                    // uptime widget for Optify's main services
                    var uptime_collection = new opty.UptimeCollection({}, { 'count': '180' });
                    uptime_collection.fetch({
                        success: function (uptimes) {
                            var currentPerc = 0;
                            var oldPerc = 0;
                            var uTotal = 0, dTotal = 0;
                            var count = 1;
                            uptimes.forEach(function (u) {
                                uTotal += u.get('uptime');
                                dTotal += u.get('downtime');
                                count++;
                                if (count == 90) {
                                    currentPerc = uTotal / (uTotal + dTotal) * 100;
                                    uTotal = 0;
                                    dTotal = 0;
                                }
                            });

                            // account for the case where there are less than 90 data points
                            if (currentPerc > 0) {
                                oldPerc = uTotal / (uTotal + dTotal) * 100;
                            }
                            else {
                                currentPerc = uTotal / (uTotal + dTotal) * 100;
                                oldPerc = currentPerc;
                            }
                            var updown = (oldPerc == currentPerc) ? 'neutral' : (oldPerc < currentPerc) ? 'up' : 'down';
                            var widget_table = new opty.PeriodCompareWidgetView({
                                title: 'system uptime',
                                goal: '99.99%',
                                actual: opty.util.formatNumber(currentPerc, 3) + '%',
                                type: updown,
                                delta: opty.util.formatNumber(Math.abs(oldPerc - currentPerc), 3) + '%',
                                period: '30 days'
                            });
                            that.$el.append($('#div1').append(widget_table.$el));
                        }

                    });

                    break;
                }

        }

        return this.$el;
    }
});
