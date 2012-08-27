var opty = opty || {};

opty.TCOModel = Backbone.Model.extend({});

opty.TCOCollection = Backbone.Collection.extend({
    initialize: function (attributes, options) {
        this.count = options.count;
    },
    model: opty.TCOModel,
    url: function () {
        if (this.count) {
            return '/ops/tco' + '?count=' + this.count;
        }
        else {
            return '/ops/tco';
        }
    }
});

