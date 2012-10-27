if (!window.Opty) { window.Opty = {}; }

Opty.SalesCalcView = Backbone.View.extend({
    initialize: function (options) {
        _.bindAll(this, 'render');

        /*
        this.collection = options.collection;
        this.group = options.group;
        this.header = options.header;
        this.footer = options.footer;
        */

    },


    render: function () {
        this.$el.empty();
        
        this.$el.append(template());
        return this.$el;
    }
});
