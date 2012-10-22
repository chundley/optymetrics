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
    lastUpdatedBy       : String,
    hidden              : Boolean,
    notes               : String,
    source              : String
});

var IncidentModel = mongoose.model('Incident', IncidentSchema);

exports.IncidentSource = {
    "PAGER_DUTY": 'PagerDuty',
    "ON_CALL": 'On-call Engineer',
    "OPS": 'Operations'
};

// The module's public api
exports.IncidentModel = IncidentModel;
