/**
* Model for mrr collection (raw data from Eli's spreadsheet)
*/
mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Model = mongoose.Model;

var MRRSchema = new Schema({
    customerId: Number,
    accountName: String,
    productType: String,
    customerType: String,
    opportunityName: String,
    opportunityOwner: String,
    productName: String,
    totalPrice: Number,
    dateAdded: Date,
    sku: String
});

// churn is tough to calculate on the fly
var MRRChurnSchema = new Schema({
    customerId: Number,
    accountName: String,
    productType: String,
    customerType: String,
    opportunityName: String,
    opportunityOwner: String,
    productName: String,
    totalPrice: Number,
    dateAdded: Date,
    sku: String  
});

// new business is tough to calculate on they fly
var MRRNewSchema = new Schema({
    customerId: Number,
    accountName: String,
    productType: String,
    customerType: String,
    opportunityName: String,
    opportunityOwner: String,
    productName: String,
    totalPrice: Number,
    dateAdded: Date,
    sku: String  
});

var MRRModelETL = mongoose.model('etlMRR', MRRSchema);
var MRRModel = mongoose.model('MRR', MRRSchema);

var MRRModelChurn = mongoose.model('mrrchurn', MRRSchema);
var MRRModelNew = mongoose.model('mrrnew', MRRSchema);

exports.MRRModelETL = MRRModelETL;
exports.MRRModel = MRRModel;

exports.MRRModelChurn = MRRModelChurn;
exports.MRRModelNew = MRRModelNew;
