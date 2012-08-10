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
    shardConfigurationId: Number
});

var CustomerSchema = new Schema({
    id: Number,
    name: String,
    createdAt: Date,
    sku: String,
    skuShort: String,
    organizations: [OrganizationSchema]
});


var OrganizationModel = mongoose.model('Organization', OrganizationSchema);
var CustomerModel = mongoose.model('Customer', CustomerSchema);

exports.OrganizationModel = OrganizationModel;
exports.CustomerModel = CustomerModel;
