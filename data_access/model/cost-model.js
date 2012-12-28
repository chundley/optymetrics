/**
* Model for cost collection (for calculating TCO)
*/
mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Model = mongoose.Model;

var CostSchema = new Schema({
    importDT: Date,
    vendor: String,
    type: String,
    detail: String,
    monthlyCost: Number,
    percBaseline: Number,
    percSEO: Number,
    percTraffic: Number,
    percEmail: Number,
    percOverhead: Number,
    notes: String
});

var CostModel = mongoose.model('Cost', CostSchema);
exports.CostModel = CostModel;
