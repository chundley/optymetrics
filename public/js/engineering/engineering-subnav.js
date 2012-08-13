var opty = opty || {};

opty.EngineeringSubNav = Backbone.View.extend({
    className: 'nav nav-pills',
    tagName: 'ul',

    initialize: function(options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render');
    },

    render: function() {
        this.$el.empty();

        this.$el.append(
            _.template('<li class="sprint-metrics active"><a href="#engineering/sprint-metrics">Sprint Metrics</a></li>' +
                       '<li class="bug-metrics"><a href="#engineering/bug-metrics">Bug Metrics</a></li>',
                        {})
        );

        if(this.options.selected) {
            this.$el.find('li').removeClass('active');
            this.$el.find('li.' + this.options.selected).addClass('active');
        }

        return this.$el;
    }
});
