if (!window.Opty) { window.Opty = {}; }

Opty.DefaultView = Backbone.View.extend({
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
                    var me = this;

                    // Needs to be wired up to a date picker control to work now

                    /*
                    // pre-render divs or the widgets will render in random order
                    var $divUptime = $('<div>', { 'class': 'span3' });

                    me.$el.append($divUptime);

                    var numDays = 30;

                    var endDate = Date.today();
                    var startDate = Date.today().add({ days: -numDays });


                    // uptime widget for Optify's main services
                    var uptimeCollection = new Opty.UptimeCollection({}, {'startDate': startDate, 'endDate': endDate });
                    var uptimeWidget = new Opty.UptimeWidgetView({ collection: uptimeCollection, title: 'system uptime', goal: '99.99%', period: numDays + ' days' });
                    $divUptime.append(uptimeWidget.$el);
                    uptimeCollection.fetch();
                    */

                    break;
                }

        }

        return this.$el;
    }
});
