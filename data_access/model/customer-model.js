// Mongoose model for customer rollup data

mongoose = require('mongoose');

// Define the schema
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Model = mongoose.Model;

var OrganizationSchema = new Schema({
    id: Number,
    name: String,
    siteDomain: String,
    createdAt: Date,
    disabled: Boolean,
    shardConfigurationId: Number,
    visitors: Number,
    visits: Number,
    pageviews: Number,
    keywords: Number,
    percTraffic: Number,
    percSEO: Number,
    tcoTraffic: Number,
    tcoSEO: Number,
    tcoTotal: Number
});

var CustomerSchema = new Schema({
    id: Number,
    name: String,
    createdAt: Date,
    sku: String,
    skuShort: String,
    visitors: Number,
    visits: Number,
    pageviews: Number,
    keywords: Number,
    percTraffic: Number,
    percSEO: Number,
    tcoTraffic: Number,
    tcoSEO: Number,
    tcoTotal: Number,
    salesforceName: String,
    mrr: Number,
    netRevenue: Number,
    organizations: [OrganizationSchema]
});


var OrganizationModel = mongoose.model('Organization', OrganizationSchema);
var CustomerModel = mongoose.model('Customer', CustomerSchema);

exports.OrganizationModel = OrganizationModel;
exports.CustomerModel = CustomerModel;
