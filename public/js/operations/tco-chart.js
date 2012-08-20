var opty = opty || {};

opty.TCOModel = Backbone.Model.extend({});

opty.TCOCollection = Backbone.Collection.extend({
    model: opty.TCOModel,
    url: '/ops/tco'
});

