if (!window.Opty) { window.Opty = {}; }

Opty.TCOModel = Backbone.Model.extend({});

Opty.TCOCollection = Backbone.Collection.extend({
    initialize: function (attributes, options) {
        this.count = options.count;
    },
    model: Opty.TCOModel,
    url: function () {
        if (this.count) {
            return '/ops/tco' + '?count=' + this.count;
        }
        else {
            return '/ops/tco';
        }
    }
});

