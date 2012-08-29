var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Model = mongoose.Model;

var MemberSchema = new Schema({
    name        : String
}); 

var ListSchema = new Schema({
    name        : String
});

var LabelSchema = new Schema({
    name        : String,
    color       : String
});

var HistorySchema = new Schema({
    list        : String,
    date        : Date
});

var StorySchema = new Schema({
    name        : String,
    size        : Number,
    members     : [MemberSchema],
    list        : String,
    labels      : [LabelSchema],
    listHistory : [HistorySchema],
    deployed    : Boolean,
    deployedOn  : Date,
    featureGroups: [String]
});

var MemberModel = mongoose.model('Member', MemberSchema);
var StoryModel = mongoose.model('Story', StorySchema);
var ListModel = mongoose.model('List', ListSchema);
var LabelModel = mongoose.model('Label', LabelSchema);

// The module's public API
exports.LabelModel = LabelModel;
exports.ListModel = ListModel;
exports.MemberModel = MemberModel;
exports.StoryModel = StoryModel;
