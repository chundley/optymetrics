var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Model = mongoose.Model;

var IncidentSchema = new Schema({
    incidentNumber      : Number,
    createdOn           : Date,
    subject             : String,
    status              : String,
    lastUpdatedOn       : Date,
    lastUpdatedBy       : String
});

var IncidentModel = mongoose.model('Incident', IncidentSchema);

// The module's public api
exports.IncidentModel = IncidentModel;
