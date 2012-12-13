if (!window.Opty) { window.Opty = {}; }

Opty.CustomerUsageModel = Backbone.Model.extend({});

Opty.CustomerUsageCollection = Backbone.Collection.extend({
    model: Opty.CustomerUsageModel,
    url: function () {
        return 'rest/productdev/feature-use-by-customer?id=' + this.customerId + '&start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
    },
    initialize: function (options) {
        this.startDate = options.startDate;
        this.endDate = options.endDate;    	
        this.customerId = options.customerId;
        _.bindAll(this, 'searchBoxChanged');
        Opty.pubsub.bind('searchbox:changed', this.searchBoxChanged, this);        
    },
    searchBoxChanged: function(data) {  	
        this.customerId = data.id;
    	this.fetch();
    }
});
