var opty = opty || {};

opty.TableView = Backbone.View.extend({
    className: 'table table-striped table-bordered table-condensed',
    tagName: 'table',

    initialize: function(options) {
        _.bindAll(this, 'render', 'collectionChanged');

        this.collection = options.collection; 
        this.table_fields = options.table_fields;
        
        this.collection.on('reset', this.collectionChanged);
    },

    collectionChanged: function() {
        this.render();
    },

    render: function() {
        this.$el.empty();
       
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
                            <td style="text-align: <%= field.text_align %>;"><%= (field.formatter) ? field.formatter(row.get(field.field)) : row.get(field.field) %></td> \
                        <% }); %> \
                        </tr> \
                <% }); %> \
            </tbody>');
       
        this.$el.append(body_template( { table_fields: this.table_fields, data: this.collection }));

        return this.$el;
    }
});
