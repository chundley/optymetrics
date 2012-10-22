if(!window.Opty) { window.Opty = {} };

/*
 * Operations incident creation form
 */
Opty.IncidentsFormView = Backbone.View.extend({
    id: 'incidents-form',

    events: {
        'click #add-incident': 'addIncident'
    },
    
    initialize: function(options) {
        var me = this;

        _.bindAll(me, 'render', 'addIncident', 'showSuccess', 'showError', 'resetForm');
    },

    addIncident: function(e) {
        var me = this,
            form = this.$el.find('.incident-form'),
            action = form.attr('action');

        var model = new Opty.IncidentsModel({
            detail: form.find('input[name="detail"]').val(),
            notes: form.find('textarea[name="notes"]').val(),
            source: form.find('select[name="source"]').val(),
            status: form.find('select[name="status"]').val(),
            incidentDate: Date.parse(form.find('input[name="incidentdate"]').val())
        });

        model.save({}, {
            success: function(model, response) {
                me.showSuccess('Incident added');
                Opty.pubsub.trigger('incident:add', {});
            },
            error: function(model, response) {
                var r = JSON.parse(response.responseText);
                me.showError(r.message);
            }
        });

        e.preventDefault();
        return false;
    },

    resetForm: function() {
        var form = this.$el.find('.incident-form');

        form.find('input[name="detail"]').val(''),
        form.find('textarea[name="notes"]').val(''),
        form.find('select[name="source"]').val('PagerDuty'),
        form.find('select[name="status"]').val('Open'),
        form.find('input[name="incidentdate"]').val(Date.today().toString('MM/dd/yyyy'));
    },

    showSuccess: function(message) {
        this.$el.find('div.alert').removeClass('alert-error').addClass('alert-success').text(message).fadeIn().delay(5000).fadeOut();
        this.resetForm();
    },

    showError: function(message) {
        this.$el.find('div.alert').removeClass('alert-success').addClass('alert-error').text(message).fadeIn().delay(5000).fadeOut();
    },
    
    render: function() {
       var formTemplate = _.template(
           '<form method="POST" class="incident-form" action="/ops/incidents/add"> \
                <label for="detail">Short Summary</label> \
                <input type="text" class="span8" name="detail" maxlength="255" /> \
                <label for="notes">Notes</label> \
                <textarea name="notes" class="span10" rows="8" /> \
                <label>Incident Date</label> \
                <input type="text" name="incidentdate" class="incident-date"/> \
                <label for="source">Source</label> \
                <select name="source"> \
                  <option value="PagerDuty">PagerDuty</option> \
                  <option value="On-call Engineer">On-call Engineer</option> \
                  <option value="Ops">Operations</option> \
                  <option value="P1 Defect">P1 Defect</option> \
                </select> \
                <label for="status">Status</label> \
                <select name="status"> \
                  <option value="open">Open</option> \
                  <option value="resolved">Resolved</option> \
                </select> \
                <button id="add-incident" name="submit" class="btn btn-primary" style="margin-top:10px; display:block">Add Incident</button> \
           </form> \
           <div class="alert" style="display: none;"></div>'
       );

       this.$el.append(formTemplate({}));

       this.$el.find('.incident-date').val((Date.today().getMonth() + 1) + "/" + Date.today().getDate() + "/" + Date.today().getFullYear())
            .datepicker();

       return this.$el;
    }
});
