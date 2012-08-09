// Metrics MongoDB data access

var logger = require('../util/logger.js'), 
    mongo_config = require('config').Mongo, 
    mongoose = require('mongoose'),
    _ = require('underscore');

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

var insertMember = function(id, name, callback) {
    MemberModel.findById(id, function(err, doc) {
        if(err) {
            callback(err);
            return;
        }

        if(!doc) {
            logger.log('info','Inserting member <' + name + '>');
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
            logger.log('info','Inserting list <' + name + '>');
            var list = new ListModel({ '_id': id, 'name': name.replace(/\[\d+\]/, '').trim() });
            list.save(function(err) { 
                (err) ? callback(err) : callback(); 
            });
        } else {
            var listName = name.replace(/\[\d+\]/, '').trim();
            if(listName != doc.name) {
                logger.log('info', 'Updating list <' + id + '>. Name changed from <' + doc.name + '> to <' + listName + '>'); 
                doc.name = listName;
                doc.save(function(err) {
                    (err) ? callback(err) : callback();
                });
            }
        }
    });
};

var getDeploymentVelocity = function(callback) {
    var group = {
        keyf: function(doc) {
            return { 'day': doc.deployedOn };
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
            callback(err, _.sortBy(results, function(val) { return val.day; }));
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
