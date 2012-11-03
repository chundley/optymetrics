if (!window.Opty) { window.Opty = {}; }

Opty.SalesCalcView = Backbone.View.extend({
    //template: 'template/sales-calculator.html',
    template: '/rest/sales/calculator',
    initialize: function (options) {
        _.bindAll(this, 'render');
    },


    render: function () {

        var me = this;
        $.get(this.template, function (t) {
            //console.log(t);
            //var html = $(t).html();
            //console.log(html);
            me.$el.html(t);
        });

        return this.$el;

        /*
        this.$el.empty();

        this.fetchTemplate(this.template, function (tmpl) {
        console.log(tmpl)
        this.$el.innerHTML = tmpl();
        });

        //this.$el.append('/rest/sales/calculator');
        return this.$el;
        */
    }
});
