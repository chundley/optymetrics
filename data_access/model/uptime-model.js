/**
* Model for uptime/downtime from Pingdom
*/
mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Model = mongoose.Model;

var UptimeSchema = new Schema({
    monitorName: String,
    monitorDate: Date,
    avgResponse: Number,
    uptime: Number,
    downtime: Number,
    unmonitored: Number,
    percUptime: Number
});

var UptimeModel = mongoose.model('Uptime', UptimeSchema);
exports.UptimeModel = UptimeModel;
