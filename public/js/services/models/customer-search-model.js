if (!window.Opty) { window.Opty = {}; }

Opty.CustomerSearchModel = Backbone.Model.extend({});

Opty.CustomerSearchCollection = Backbone.Collection.extend({
    model: Opty.CustomerSearchModel,
    url: function () {
        return '/rest/services/find-customer?q=' + this.query;
    },
    initialize: function (options) {
        this.query = options.query;
    }
});

