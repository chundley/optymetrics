if (!window.Opty) { window.Opty = {}; }

Opty.DefaultView = Backbone.View.extend({
    id: 'default-view',
    className: 'row',

    initialize: function (options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render');
    },
    render: function () {
        switch (this.options.selected) {
            default:
                {
                    var me = this;

                    //var $divContainer = $('<div>', { 'class': 'row' });
                    //me.$el.append($divContainer);

                    me.$el.append('<div class="span9" style="color: #ff3333; font-size: 22px;">DEMO DATA ON THIS PAGE, NOT LIVE YET!!!</div><br>');
                    var $divLeftPanel = $('<div>', { 'class': 'span9' });
                    //$divContainer.append($divLeftPanel);
                    me.$el.append($divLeftPanel);

                    var $divRightPanel = $('<div>', { 'class': 'span3' });
                    me.$el.append($divRightPanel);

                    var $divWidgetContainer = $('<div>', { 'class': 'widget-container-outline' });
                    $divRightPanel.append($divWidgetContainer);

                    $divWidgetContainer.append('<div class="header">APP USAGE</div>');

                    var triPaneMetricSales = new Opty.TriPaneMetricWidgetView({ collection: null, group: 'SALES', header: 'Month', footer: 'New MRR' });

                    $divLeftPanel.append(triPaneMetricSales.$el);

                    var triPaneMetricMarketing = new Opty.TriPaneMetricWidgetView({ collection: null, group: 'MARKETING', header: 'Month', footer: 'New Leads' });
                    $divLeftPanel.append(triPaneMetricMarketing.$el);

                    /*
                    // Needs to be wired up to a date picker control to work now


                    // pre-render divs or the widgets will render in random order
                    var $divUptime = $('<div>', { 'class': 'span3' });

                    me.$el.append($divUptime);

                    //var $divUptimeTrend = $('<div>', { 'class': 'span3' });
                    var numDays = 30;

                    var endDate = Date.today();
                    var startDate = Date.today().add({ days: -numDays });

                    // uptime widget for Optify's main services
                    var uptimeAggregateCollection = new Opty.UptimeAggregateCollection({ 'startDate': startDate, 'endDate': endDate });
                    var uptimeWidget = new Opty.UptimeAggregateWidgetView({ collection: uptimeAggregateCollection, title: 'system uptime', goal: '99.99%' });
                    $divUptime.append(uptimeWidget.$el);
                    uptimeAggregateCollection.fetch();

                    // fetch and render uptime trend widget for for services
                    var uptimeCollection = new Opty.UptimeCollection({ 'startDate': startDate, 'endDate': endDate });
                    var uptimeWidget2 = new Opty.UptimeWidgetView({ collection: uptimeCollection, title: 'system - daily status' });
                    $divUptime.append($('<br />'));
                    $divUptime.append(uptimeWidget2.$el);
                    uptimeCollection.fetch();
                    */
                    break;
                }

        }

        return this.$el;
    }
});
