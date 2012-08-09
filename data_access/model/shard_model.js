// Mongoose model for shard data

mongoose = require('mongoose');

// Define the schema
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Model = mongoose.Model;

var ShardSchema = new Schema({
    id: Number,
    name: String,
    jdbcUrl: String,
    user: String,
    password: String,
    disabled: Boolean
});

var ShardModel = mongoose.model('Shard', ShardSchema);
exports.ShardModel = ShardModel;
