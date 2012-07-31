// Metrics MongoDB data access

var mongoose = require('mongoose'),
    _ = require('underscore');

var db = 'mongodb://localhost/metrics';

// Define our schema
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
    deployedOn  : Date
});

var MemberModel = mongoose.model('Member', MemberSchema);
var StoryModel = mongoose.model('Story', StorySchema);
var ListModel = mongoose.model('List', ListSchema);
var LabelModel = mongoose.model('Label', LabelSchema);


var connect = function() {
    mongoose.connect(db);
};

var disconnect = function() {
    mongoose.disconnect();
};

var insertMember = function(id, name, callback) {
    MemberModel.findById(id, function(err, doc) {
        if(err) {
            callback(err);
            return;
        }

        if(!doc) {
            console.log('Inserting member <' + name + '>');
            var member = new MemberModel({ '_id': id, 'name': name });
            member.save(function(err) {
                (err) ? callback(err) : callback(); 
            });
        }
    });
};

var insertList = function(id, name, callback) {
    ListModel.findById(id, function(err, doc) {
        if(err) {
            callback(err);
            return;
        }

        if(!doc) {
            console.log('Inserting list <' + name + '>');
            var list = new ListModel({ '_id': id, 'name': name.replace(/\[\d+\]/, '').trim() });
            list.save(function(err) { 
                (err) ? callback(err) : callback(); 
            });
        }   
    }); 
};

var getDeploymentVelocity = function(callback) {
    var group = {
        keyf: function(doc) {
            var dateKey = doc.deployedOn.getFullYear() + "/" + (doc.deployedOn.getMonth() + 1) + "/" + doc.deployedOn.getDate();
            return { 'day': dateKey };
        },
        cond: { deployed: true },
        initial: { velocity: 0 },
        reduce: function(doc, out) { 
            out.velocity += doc.size;
        },
    };

    StoryModel.collection.group(
        group.keyf,
        group.cond,
        group.initial,
        group.reduce,
        null,
        true,
        function(err, results) {
            debugger;
            callback(err, results);
        }
    );
};

// The module's public API
exports.LabelModel = LabelModel;
exports.ListModel = ListModel;
exports.MemberModel = MemberModel;
exports.StoryModel = StoryModel;
exports.getDeploymentVelocity = getDeploymentVelocity;
exports.insertMember = insertMember;
exports.insertList = insertList;
exports.connect = connect;
exports.disconnect = disconnect;
