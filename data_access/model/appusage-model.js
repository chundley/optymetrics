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


var DailyAppUsageRawModel = mongoose.model('DailyAppUsageRaw', DailyAppUsageRawSchema);
var MonthlyCustomerStatsModel = mongoose.model('MonthlyCustomerStats', MonthlyCustomerStatsSchema);

// The module's public API
exports.DailyAppUsageRawModel = DailyAppUsageRawModel;
exports.MonthlyCustomerStatsModel = MonthlyCustomerStatsModel;
