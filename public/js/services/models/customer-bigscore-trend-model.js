if (!window.Opty) { window.Opty = {}; }

Opty.BigScoreTrendForCustomer = Backbone.Model.extend({});

Opty.BigScoreTrendForCustomerCollection = Backbone.Collection.extend({
    model: Opty.BigScoreTrendForCustomer,
    url: function () {
        return '/rest/services/customer-bigscore-trend?id=' + this.customerId + '&start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();
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

