var opty = opty || {};

opty.OperationsView = Backbone.View.extend({
    id: 'operations-view',
    className: 'row-fluid',

    initialize: function (options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render');
    },

    render: function () {
        switch (this.options.selected) {
            case 'tco-metrics':
                {
                    break;
                }
            default:
                {
                    break;
                }
        }

        return this.$el;
    }
});
