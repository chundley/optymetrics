if (!window.Opty) { window.Opty = {}; }

Opty.TableView = Backbone.View.extend({
    className: 'table table-striped table-bordered table-condensed',
    tagName: 'table',
    // Default column formatters.
    columnFormatters: {
        date: function(data) {
            if(data) {
                var date = new Date(data);
                return date.getUTCFullYear() + '-' + Opty.util.padNumber(date.getUTCMonth() + 1, 2) + 
                    '-' + Opty.util.padNumber(date.getUTCDate(), 2); 
            } else {
                return "";
            }
        }
    },
    initialize: function(options) {
        _.bindAll(this, 'render', 'collectionChanged');

        this.collection = options.collection; 
        this.table_fields = options.table_fields;
        
        this.collection.on('reset', this.collectionChanged);

        this.$el.css('display', 'none');
    },

    collectionChanged: function() {
        this.render();
    },

    render: function() {
        this.$el.empty();
        this.$el.css('display', 'table');
        
        var header_template = _.template(
           '<thead><tr> \
           <% _.each(table_fields, function(header) { %> \
               <th class="<%= header.field %>" style="text-align: <%= header.text_align %>;"><%= header.display_name %></th> \
            <% }); %> \
            </tr></thead>');

        this.$el.append(header_template({ table_fields: this.table_fields }));

        var body_template = _.template(
            '<tbody> \
                <% data.forEach(function(row) { %> \
                        <tr> \
                        <% _.each(table_fields, function(field) { %> \
                            <td style="text-align: <%= field.text_align %>;"> \
                                <% if(field.formatter) { \
                                      if(typeof(field.formatter) === "function") { \
                                          %><%= field.formatter(row.get(field.field)) %>  \
                                   <% } else if(typeof(field.formatter) === "string") { \
                                          %><%= view.columnFormatters[field.formatter](row.get(field.field)) %> \
                                   <% } \
                                   } else { %> \
                                      <%= row.get(field.field) %> \
                                <% } %> \
                        <% }); %> \
                        </tr> \
                <% }); %> \
            </tbody>');
       
        this.$el.append(body_template( { table_fields: this.table_fields, data: this.collection, view: this }));

        if (this.options.sortable) {
            this.$el.addClass('tablesorter');
            if (this.options.defaultSort) {
                this.$el.tablesorter({
                    sortList: this.options.defaultSort,
                    sortInitialOrder: this.options.sortInitialOrder
                });
            } else {
                this.$el.tablesorter();
            }

        }

        return this.$el;
    }
});
