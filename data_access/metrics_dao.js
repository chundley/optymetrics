// Metrics MongoDB data access

var logger = require('../util/logger.js'), 
    mongo_config = require('config').Mongo, 
    mongoose = require('mongoose'),
    _ = require('underscore'),
    date_util = require('../util/date_util.js'),
    logger = require('../util/logger.js');

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
    deployedOn  : Date,
    featureGroups: [String]
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
    var map = function() {
        var getWeek = function(d) {
            /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */
            dowOffset = 1;
            var newYear = new Date(d.getFullYear(),0,1);
            var day = newYear.getDay() - dowOffset;
            day = (day >= 0 ? day : day + 7);
            var daynum = Math.floor((d.getTime() - newYear.getTime() - (d.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
            var weeknum;
            if (day < 4) {
                weeknum = Math.floor((daynum+day-1)/7) + 1;
                if(weeknum > 52) {
                    nYear = new Date(d.getFullYear() + 1,0,1);
                    nday = nYear.getDay() - dowOffset;
                    nday = nday >= 0 ? nday : nday + 7;
                    weeknum = nday < 4 ? 1 : 53;
                }
            } else {
                weeknum = Math.floor((daynum+day-1)/7);
            }

            return weeknum;
        };
      
        var isDefect = function(story) {
            for(var i = 0; i < story.labels.length; i++) {
                if(story.labels[i].name.toLowerCase().indexOf('defect') != -1) {
                    return true;
                }
            }
            return false; 
        };

        var isFeature = function(story) {
            for(var i = 0; i < story.labels.length; i++) {
                if(story.labels[i].name.toLowerCase().indexOf('feature') != -1) {
                    return true;
                }
            }
            return false; 
        };

        var isExcellence = function(story) {
            for(var i = 0; i < story.labels.length; i++) {
                if(story.labels[i].name.toLowerCase().indexOf('excellence') != -1) {
                    return true;
                }
            }
            return false; 
        };

        var key = getWeek(this.deployedOn) + '-' + this.deployedOn.getFullYear();

        if(isDefect(this)) {
            emit(key,  { type: 'defect', size: this.size });
        } else if(isFeature(this)) {
            emit(key,  { type: 'feature', size: this.size });
        } else if(isExcellence(this)) {
            emit(key, { type: 'excellence', size: this.size });
        } else { // Unlabeled stories get treated as features
            emit(key,  { type: 'feature', size: this.size });
        }
    };

    var reduce = function(key, values){
        var by_week = {};  
        by_week.weeknum_year_type = key;
        by_week.defect_velocity = 0;
        by_week.feature_velocity = 0;
        by_week.excellence_velocity = 0;
        values.forEach(function(value){
            if(value.type == 'defect') {
                by_week.defect_velocity += value.size;
            } else if(value.type == 'feature') { 
                by_week.feature_velocity += value.size;
            } else if (value.type == 'excellence') {
                by_week.excellence_velocity += value.size;
            }
        });
        return by_week;
    };

    var command = {
        mapreduce: 'stories',
        query: { deployed: true },
        map:  map.toString(),
        reduce: reduce.toString(), // map and reduce functions need to be strings
        out: { inline: 1 }
    };

    mongoose.connection.db.executeDbCommand(
        command, function(err, results) {
            if(err) {
                logger.log('error', err);
            }

            if(results.numberReturned > 0) {
                callback(
                    err, 
                    _.map(results.documents[0].results, 
                          function(result, key) {
                              var weeknum, year, type;
                              var split_key = result._id.split('-');
                              weeknum = split_key[0];
                              year = split_key[1];
                              return {  week_of: new Date(date_util.firstDayOfWeek(weeknum, year)), defect_velocity: result.value.defect_velocity, 
                                        feature_velocity: result.value.feature_velocity, excellence_velocity: result.value.excellence_velocity, total: result.value.defect_velocity + result.value.feature_velocity + result.value.excellence_velocity }; 
                          }
                    )
                );
            } else {
                callback(err, []);
            }
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
