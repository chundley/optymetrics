/**
* Mongoose model for the shards collection
*/

mongoose = require('mongoose');

// Define the schema
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Model = mongoose.Model;

var ShardSchema = new Schema({
    id: Number,
    name: String,
    connectionString: String,
    user: String,
    password: String,
    disabled: Boolean
});

var ShardModelETL = mongoose.model('etlShard', ShardSchema);
var ShardModel = mongoose.model('Shard', ShardSchema);

exports.ShardModelETL = ShardModelETL;
exports.ShardModel = ShardModel;
