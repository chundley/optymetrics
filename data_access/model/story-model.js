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
    listBefore  : String,
    listAfter   : String,
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

var CycleTimeSchema = new Schema({
    storyId         : ObjectId,
    deployedOn      : Date,
    size            : Number,
    cycleTimeDays   : Number
});

exports.MemberModel = mongoose.model('Member', MemberSchema);
exports.StoryModel = mongoose.model('Story', StorySchema);
exports.ListModel = mongoose.model('List', ListSchema);
exports.LabelModel = mongoose.model('Label', LabelSchema);
exports.CycleTimeModel = mongoose.model('CycleTime', CycleTimeSchema);
