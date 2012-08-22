/**
* Model for uptime/downtime from Pingdom
*/
mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Model = mongoose.Model;

var UptimeSchema = new Schema({
    monitor: String,
    starttime: Date,
    avgresponse: Number,
    uptime: Number,
    downtime: Number,
    unmonitored: Number
});

var UptimeModel = mongoose.model('Uptime', UptimeSchema);
exports.UptimeModel = UptimeModel;
