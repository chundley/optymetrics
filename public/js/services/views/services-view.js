if(!window.Opty) { window.Opty = {}; }

Opty.ServicesView = Backbone.View.extend({
    id: 'services-view',

    initialize: function (options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render', 'renderResearch');
    },

    render: function () {
        switch (this.options.selected) {
            case 'support':
                {
                    // todo
                    break;
                }
            case 'research':
            default:
                {
                    this.renderResearch();
                    break;
                }
        }
        return this.$el;
    },

    renderResearch: function () {
        var me = this;
        me.$el.append('Customer Research page');
    },
    renderSomething: function() {
        var me = this;
    }

});
