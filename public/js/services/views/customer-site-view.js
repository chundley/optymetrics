if (!window.Opty) { window.Opty = {}; }

Opty.CustomerSiteView = Backbone.View.extend({
    initialize: function (options) {
        var me = this;
        _.bindAll(me, 'render');
        me.collection = options.collection;
        me.collection.on('reset', this.render);
    },
    events : {
        'click #sitetableheader' : 'toggleSiteTable'
    },
    toggleSiteTable: function(e) {
        var theDiv = this.$el.find('#sitetablecontainer');
        if (theDiv.is(':visible')) {
            theDiv.removeClass('show');
            theDiv.addClass('hide');
        }
        else {
            theDiv.removeClass('hide');
            theDiv.addClass('show');
        }
    },
    render: function () {
        var me = this;
        this.$el.empty();

        // crappy boilerplate to convert site array into a backbone collection for table rendering
        var SiteModel = Backbone.Model.extend({});
        var SiteCollection = Backbone.Collection.extend({
            model: SiteModel
        });

        var siteCollection = new SiteCollection();
        siteCollection.reset(me.collection.models[0].get('organizations'));

        
        var sites_table = new Opty.TableView({
            table_fields: [
                {
                    field: 'name',
                    display_name: 'Site name'
                },
                {
                    field: 'siteDomain',
                    display_name: 'Domain',
                    formatter: function(data) {
                        return '<a href="' + data + '" target="_new">' + data + '</a>';
                    }
                },
                {
                    field: 'id',
                    display_name: 'Spoof',
                    text_align: 'center',
                    formatter: function(data) {
                        return '<a href="http://dashboard.optify.net/admin/index:spoofSite/' + data + '" target="_new">==></a>';
                    }
                },
                {
                    field: 'createdAt',
                    display_name: 'Date created',
                    formatter: 'date',
                    text_align: 'right'
                },
                {
                    field: 'pageviews',
                    display_name: 'PV (30d)',
                    text_align: 'right',
                    formatter: function(data) {
                        return Opty.util.formatNumber(data, 0)
                    }
                },
                {
                    field: 'visitors',
                    display_name: 'Visitors (30d)',
                    text_align: 'right',
                    formatter: function(data) {
                        return Opty.util.formatNumber(data, 0)
                    }
                },
                {
                    field: 'keywords',
                    display_name: 'Keywords',
                    text_align: 'right',
                    formatter: function(data) {
                        return Opty.util.formatNumber(data, 0)
                    }
                },
                {
                    field: 'tcoTraffic',
                    display_name: '$ Traffic',
                    text_align: 'right',
                    formatter: function(data) {
                        return '$' + Opty.util.formatNumber(data, 0)
                    }
                },
                {
                    field: 'tcoSEO',
                    display_name: '$ SEO',
                    text_align: 'right',
                    formatter: function(data) {
                        return '$' + Opty.util.formatNumber(data, 0)
                    }
                },
                {
                    field: 'tcoTotal',
                    display_name: '$ Total',
                    text_align: 'right',
                    formatter: function(data) {
                        return '$' + Opty.util.formatNumber(data, 0)
                    }
                }
            ],
            sortable: true,
            defaultSort: [[8, 1]],            
            collection: siteCollection
        });
        
        var $divTitle = $('<div class="widget-group-header-container" id="sitetableheader"><div class="widget-group-header"><span>Sites</span></div></div>');
        var $divTableContainer = $('<div id="sitetablecontainer"></div>');
        $divTableContainer.append(sites_table.$el);
        this.$el.append($divTitle);
        this.$el.append($divTableContainer);
        sites_table.render();
        return this.$el;
    }
});
