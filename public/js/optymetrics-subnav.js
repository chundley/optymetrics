if (!window.Opty) { window.Opty = {}; }

Opty.OptyMetricSubNav = Backbone.View.extend({
    className: 'nav nav-pills well well-small',
    tagName: 'ul',

    initialize: function(options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render');
    },

    render: function() {
        var me = this;
        this.$el.empty();

        var pill_template = _.template('<li class="<%= url_fragment %><% if(typeof(selected) != "undefined" && selected) { %> active<% } %>"><a href="' +
                                       me.options.root_hash + '/<%= url_fragment %>"><%= title %></a></li>');

        _.each(this.options.nav_options, function(option) {
            me.$el.append(pill_template(option));    
        });

        return this.$el;
    }
});
