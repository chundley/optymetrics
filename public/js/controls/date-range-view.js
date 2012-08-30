if(!window.Opty) { window.Opty = {}; }

Opty.DateRangeView = Backbone.View.extend({
    className: 'span2',
    initialize: function (options) {
        var me = this;
        me.options = options;
        _.bindAll(this, 'render', 'dateRangeChanged');
    },

    render: function () {
        var me = this;

        this.$input = $('<input>', { 'name': 'daterange', 'id': 'daterange', 'type': 'text' });

        this.$el.append(this.$input);

        this.$input.daterangepicker(
          {
              ranges: {
                  'Last 7 Days': [Date.today().add({ days: -6 }), 'today'],
                  'Last 30 Days': [Date.today().add({ days: -29 }), 'today'],
                  'This Month': [Date.today().moveToFirstDayOfMonth(), Date.today().moveToLastDayOfMonth()],
                  'Last Month': [Date.today().moveToFirstDayOfMonth().add({ months: -1 }),
                      Date.today().moveToFirstDayOfMonth().add({ days: -1 })]
              }
          },
            me.dateRangeChanged
        );

        // set default to 30 days, option 'defaultDays' can override this
        var defDays = 29;
        if (!isNaN(me.options.defaultDays)) {
            defDays = me.options.defaultDays - 1;
        }
        this.dateRangeChanged(Date.today().add({ days: -defDays }), Date.today());

        return this.$el;
    },

    dateRangeChanged: function (start, end) {
        this.$input.val(start.toString('MMMM d, yyyy') + ' - ' + end.toString('MMMM d, yyyy'));
        Opty.pubsub.trigger('reportrange:changed', { start: start, end: end });
    }
});
