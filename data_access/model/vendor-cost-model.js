/**
* Model for vendor cost
*/

mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Model = mongoose.Model;

var VendorCostSchema = new Schema({
    billngMonth: Date,
    vendorName: String,
    amount: Number,
    percSEO: Number,
    percLeads: Number,
    percEmail: Number,
    percOverhead: Number,
    notes: String,
    amountSEO: Number,
    amountLeads: Number,
    amountEmail: Number,
    amountOverhead: Number
});

var VendorCostModel = mongoose.model('VendorCost', VendorCostSchema);
exports.VendorCostModel = VendorCostModel;
