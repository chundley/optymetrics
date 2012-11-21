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

// rollup that aggregates all products by customer by month
var MRRCustomerAggregateSchema = new Schema({
    customerId: Number,
    accountName: String,
    productType: String,
    customerType: String,
    totalPrice: Number,
    dateAdded: Date,
    sku: String    
});

// rollup aggregated by type/sku/month
var MRRSKUAggregateSchema = new Schema({
    productType: String,
    totalPrice: Number,
    dateAdded: Date,
    sku: String
});

var MRRModelETL = mongoose.model('etlMRR', MRRSchema);
var MRRModel = mongoose.model('MRR', MRRSchema);

var MRRCustomerAggregate = mongoose.model('agg_mrr_customer', MRRSchema);
var MRRSKUAggregate = mongoose.model('agg_mrr_sku', MRRSchema);

exports.MRRModelETL = MRRModelETL;
exports.MRRModel = MRRModel;

exports.MRRCustomerAggregate = MRRCustomerAggregate;
exports.MRRSKUAggregate = MRRSKUAggregate;
