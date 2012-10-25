var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Model = mongoose.Model;

var DailyAppUsageRawSchema = new Schema({
    app         : String,
    eventApp   : String,
    eventName  : String,
    customerId : Number,
    sku         : String,
    userId     : Number,
    dateOf     : {type: Date, index: { unique: false }},
    eventCount : Number
});

var MonthlyCustomerStatsSchema = new Schema({
    monthOf         : Date,
    sku             : String,
    customerCount   : Number
});
MonthlyCustomerStatsSchema.index({ monthOf: 1, sku: 1 }, { unique: true });

var WeeklyCustomerUserStatsSchema = new Schema({
    weekOf         : Date,
    sku             : String,
    days            : Number,
    customerCount   : Number,
    userCount       : Number,
    totalDailyVisits : Number
});
WeeklyCustomerUserStatsSchema.index({ weekOf: 1, sku: 1 }, { unique: true });

var WeeklyFeatureUsageStatsSchema = new Schema({
    feature  : String, 
    weekNum  : String, 
    weekOf  : String, 
    uniqueUsers  : Number, 
    uniqueCustomers  : Number, 
    visits  : Number, 
    timeOnFeature  : Number, 
    pageviews  : Number, 
    percentCustomersUsing  : Number, 
    percentUsersUsing  : Number, 
    percentCustomersUsingExcludeEmail  : Number, 
    percentUsersUsingExcludeEmail  : Number, 
    timeOnfeatureRowNum  : Number, 
    pageviewsRowNum  : Number, 
    visitsRowNum  : Number 
});
WeeklyFeatureUsageStatsSchema.index({ weekNum: 1, feature: 1 }, { unique: true });

var DailyAppUsageRawModel = mongoose.model('DailyAppUsageRaw', DailyAppUsageRawSchema);
var MonthlyCustomerStatsModel = mongoose.model('MonthlyCustomerStats', MonthlyCustomerStatsSchema);
var WeeklyCustomerUserStatsModel = mongoose.model('WeeklyCustomerUserStats', WeeklyCustomerUserStatsSchema);
var WeeklyFeatureUsageStatsModel = mongoose.model('WeeklyFeatureUsageStats', WeeklyFeatureUsageStatsSchema);

// The module's public API
exports.DailyAppUsageRawModel = DailyAppUsageRawModel;
exports.MonthlyCustomerStatsModel = MonthlyCustomerStatsModel;
exports.WeeklyCustomerUserStatsModel = WeeklyCustomerUserStatsModel;
exports.WeeklyFeatureUsageStatsModel = WeeklyFeatureUsageStatsModel;