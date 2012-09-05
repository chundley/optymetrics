if(!window.Opty) { window.Opty = {}; }

Opty.StoryModel = Backbone.Model.extend({});

Opty.StoryCollection = Backbone.Collection.extend({
    model: Opty.StoryModel, 
    url: function() {
        var url = '/rest/productdev/stories?start=' + this.startDate.getTime() + '&end=' + this.endDate.getTime();

        if(this.featureGroup) {
            url += "&fg=" + encodeURI(this.featureGroup);
        }

        return url;
    },

    initialize: function(options) {
        _.bindAll(this, 'reportRangeChanged', 'featureGroupChanged');
        Opty.pubsub.bind('reportrange:changed', this.reportRangeChanged, this);
        Opty.pubsub.bind('featuregroup:changed', this.featureGroupChanged, this);
    },

    featureGroupChanged: function(featureGroup) {
        this.featureGroup = featureGroup;
        this.fetch();
    },

    reportRangeChanged: function(data) {
        this.startDate = data.start;
        this.endDate = data.end;
    }
});
