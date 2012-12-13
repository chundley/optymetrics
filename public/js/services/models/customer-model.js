if (!window.Opty) { window.Opty = {}; }

Opty.CustomerModel = Backbone.Model.extend({});

Opty.CustomerCollection = Backbone.Collection.extend({
    model: Opty.CustomerModel,
    url: function () {
        return '/rest/services/customer/' + this.customerId;
    },
    initialize: function (options) {
        this.customerId = options.customerId;
        _.bindAll(this, 'searchBoxChanged');
        Opty.pubsub.bind('searchbox:changed', this.searchBoxChanged, this);        
    },
    searchBoxChanged: function(data) {
    	this.customerId = data.id;
    	this.fetch();
    }
});
