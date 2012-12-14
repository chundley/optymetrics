if (!window.Opty) { window.Opty = {}; }

Opty.MRRTrendForCustomer = Backbone.Model.extend({});

Opty.MRRTrendForCustomerCollection = Backbone.Collection.extend({
    model: Opty.MRRTrendForCustomer,
    url: function () {
        return '/rest/sales/mrr-trend-by-customer?id=' + this.customerId + '&start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
    },
    initialize: function (options) {
        this.customerId = options.id;
        this.startDate = options.startDate;
        this.endDate = options.endDate;
        _.bindAll(this, 'searchBoxChanged');
        Opty.pubsub.bind('searchbox:changed', this.searchBoxChanged, this);        
    },
    searchBoxChanged: function(data) {
        this.customerId = data.id;
        this.fetch();
    }
});

