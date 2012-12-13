if(!window.Opty) { window.Opty = {}; }

Opty.SearchBoxView = Backbone.View.extend({
    className: 'span3',
    initialize: function (options) {
        var me = this;
        _.bindAll(me, 'render');
        me.collection = options.collection;
        me.collection.on('reset', this.render);
    },

    render: function () {
        var me = this;
        var $inputDiv = $('<input>', { 'name': 'searchbox', 'id': 'searchbox', 'type': 'text', 'class': 'input-xlarge' });
        this.$el.append($inputDiv);

        this.$el.find('#searchbox').autocomplete({
          source: me.collection.pluck('name'),
          minLength: 2,
          select: function(event, ui) {
            var selectedModel = me.collection.where({name: ui.item.value})[0];
            Opty.pubsub.trigger('searchbox:changed', { id: selectedModel.get('id') });
          }
        });

        return this.$el;
    }

});
