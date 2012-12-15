if(!window.Opty) { window.Opty = {}; }

Opty.ServicesView = Backbone.View.extend({
    id: 'services-view',

    initialize: function (options) {
        var me = this;
        me.options = options;

        _.bindAll(me, 'render', 'renderResearch');
    },

    render: function () {
        switch (this.options.selected) {
            case 'support':
                {
                    // todo
                    break;
                }
            case 'research':
            default:
                {
                    this.renderResearch(this.options.id);
                    break;
                }
        }
        return this.$el;
    },

    renderResearch: function (id) {
        var me = this;

        // Unbind all searchbox:changed listeners. TODO: More robust view cleanup
        Opty.pubsub.unbind('searchbox:changed');

        // Configure search box
        var $customerSearchRow = $('<div>', { 'class': 'row' });
        $customerSearchRow.append('<div class="span1" style="font-size: 16px; color: #dddddd; padding-top: 5px;">Customer</div>');

        var customerSearchCollection = new Opty.CustomerSearchCollection({query: ''});
        customerSearchCollection.fetch();
        var customerSearchView = new Opty.SearchBoxView({collection: customerSearchCollection});

        $customerSearchRow.append(customerSearchView.$el);
        me.$el.append($customerSearchRow);
        // end search box config

        /*
        
        $outerRow
        -------------------------------------------------------------------------------------------
        | $leftDiv                                              | $rightDiv                        |
        |                                                       |                                  |
        | $firstRowLeft                                         | $firstRowRight                   |
        | ----------------------------------------------------  | -------------------------------- |
        | | $sitesDiv                                        |  | | $summaryDiv                  | |
        | ----------------------------------------------------- | -------------------------------- |
        |                                                       |                                  |
        | $secondRowLeft                                        | $secondRowRight                  |
        | ----------------------------------------------------- | -------------------------------- |
        | | $leftSubOuterDiv                                  | | | $mrrHistoryDiv               | |
        | |                                                   | | -------------------------------- |
        | | $firstRowLeftSub                                  | |                                  |
        | | ----------------------- ------------------------  | |                                  |
        | | | $leftSubLeftDiv      | $leftSubRightDiv       | | |                                  |
        | | |                      |                        | | |                                  |
        | | | $leftSubLeftFirstRow | $leftSubRightFirstRow  | | |                                  |
        | | | -------------------- | ---------------------  | | |                                  |
        | | | | $usageDiv        | | | $bigscoreDiv      |  | | |                                  |
        | | | -------------------- | ---------------------  | | |                                  |
        | | |                      |                        | | |                                  |
        | | |                      | $leftSubRightSecondRow | | |                                  |
        | | |                      | ---------------------- | | |                                  |
        | | |                      | | $bigscoreHistoryDiv| | | |                                  |
        | | |                      | ---------------------- | | |                                  |
        | | |                      |                        | | |                                  |
        | | ------------------------------------------------| | |                                  |
        | ----------------------------------------------------- |                                  |
        |------------------------------------------------------------------------------------------|
        
        */

        var bigSpanClass = 'span13';
        var halfSpanClass = 'span6';
        var smallSpanClass = 'span4';

        // outer layout components
        var $outerRow = $('<div>', { 'class': 'row' });
        var $leftDiv = $('<div>', { 'class': bigSpanClass });
        var $rightDiv = $('<div>', { 'class': smallSpanClass });
        $outerRow.append($leftDiv);
        $outerRow.append($rightDiv);

        // left side - rows
        var $firstRowLeft = $('<div>', { 'class': 'row' });
        var $secondRowLeft = $('<div>', { 'class': 'row' });
        $leftDiv.append($firstRowLeft);
        $leftDiv.append($secondRowLeft);

        // DATA: sites div
        var $sitesDiv = $('<div>', { 'class': bigSpanClass });
        $firstRowLeft.append($sitesDiv);
        
        // sub-left div + sub left rows
        var $leftSubOuterDiv = $('<div>', { 'class': bigSpanClass });
        var $firstRowLeftSub = $('<div>', { 'class': 'row' });
        $leftSubOuterDiv.append($firstRowLeftSub);
        $secondRowLeft.append($leftSubOuterDiv);

        // sub divs in first row left sub 
        var $leftSubLeftDiv = $('<div>', { 'class': halfSpanClass });
        var $leftSubLeftFirstRow = $('<div>', { 'class': 'row' });
        $leftSubLeftDiv.append($leftSubLeftFirstRow);
        $firstRowLeftSub.append($leftSubLeftDiv);

        var $leftSubRightDiv = $('<div>', { 'class': halfSpanClass });
        var $leftSubRightFirstRow = $('<div>', { 'class': 'row' });
        var $leftSubRightSecondRow = $('<div>', { 'class': 'row', 'style': 'padding-top: 8px;' });
        $leftSubRightDiv.append($leftSubRightFirstRow);
        $leftSubRightDiv.append($leftSubRightSecondRow);
        $firstRowLeftSub.append($leftSubRightDiv);

        // DATA: usage div
        var $usageDiv = $('<div>', { 'class': halfSpanClass });
        $leftSubLeftFirstRow.append($usageDiv);

        // DATA: big score div
        var $bigscoreDiv = $('<div>', { 'class': halfSpanClass });
        $leftSubRightFirstRow.append($bigscoreDiv);

        // DATA: big score history div
        var $bigscoreHistoryDiv = $('<div>', { 'class': halfSpanClass });
        $leftSubRightSecondRow.append($bigscoreHistoryDiv);

        // right side - rows
        var $firstRowRight = $('<div>', { 'class': 'row' });
        $rightDiv.append($firstRowRight);

        var $secondRowRight = $('<div>', { 'class': 'row' });
        $rightDiv.append($secondRowRight);

        // DATA: summary div
        var $summaryDiv = $('<div>', { 'class': smallSpanClass });
        $firstRowRight.append($summaryDiv);

        // DATA: mrr history div
        var $mrrHistoryDiv = $('<div>', { 'class': smallSpanClass });
        $secondRowRight.append($mrrHistoryDiv);


        var customerCollection = new Opty.CustomerCollection({});
        var customerSummaryView = new Opty.CustomerSummaryView({collection: customerCollection});
        var customerSiteView = new Opty.CustomerSiteView({collection: customerCollection});
        $summaryDiv.append(customerSummaryView.$el);
        $sitesDiv.append(customerSiteView.$el);

        var usageCollection = new Opty.CustomerUsageCollection({startDate: Date.today().add({ days: -30 }), endDate: Date.today()});
        var usageSummaryView = new Opty.CustomerUsageView({collection: usageCollection});
        $usageDiv.append(usageSummaryView.$el);

        var mrrTrendCollection = new Opty.MRRTrendForCustomerCollection({startDate: Date.today().add({ days: -365 }), endDate: Date.today()});
        var mrrTrendView = new Opty.MRRCustomerHistoryChart({collection: mrrTrendCollection});
        $mrrHistoryDiv.append(mrrTrendView.$el);

        var bigscoreTrendCollection = new Opty.BigScoreTrendForCustomerCollection({startDate: Date.today().add({ days: -90 }), endDate: Date.today()});
        var bigscoreWidget = new Opty.BigScoreWidgetView({collection: bigscoreTrendCollection, cssClass: '', header: 'Big Score', footer: '4-week rolling average'});
        $bigscoreDiv.append(bigscoreWidget.$el);

        var bigscoreCustomerHistoryChart = new Opty.BigscoreCustomerHistoryChart({collection: bigscoreTrendCollection});
        $bigscoreHistoryDiv.append(bigscoreCustomerHistoryChart.$el);

        me.$el.append($outerRow);

        // if an id is present this was a hard-coded request for customer detail
        if (id) {
            Opty.pubsub.trigger('searchbox:changed', { id: id });
        }

    },
    renderSomething: function() {
        var me = this;
    }

});
