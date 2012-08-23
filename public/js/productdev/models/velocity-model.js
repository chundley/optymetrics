if(!window.Opty) { window.Opty = {}; }

/**
 * Weekly velocity data
 */
Opty.VelocityModel = Backbone.Model.extend({});

Opty.VelocityCollection = Backbone.Collection.extend({
    model: Opty.VelocityModel, 
    url: '/dev/velocity'
});
