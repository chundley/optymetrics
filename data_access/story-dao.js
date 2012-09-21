/**
 * Access to stories collection in MongoDB
 * TODO: Split member and list access into separate dao
 */

/**
 * Node libraries
 */
var async = require('async'), 
    mongoConfig = require('config'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    _ = require('underscore')

/**
 * Project includes
 */
var date_util = require('../util/date_util.js'),
    logger = require('../util/logger.js'),
    storyModel = require('./model/story-model.js'); 

/** 
 * Inserts a member (Trello project user) into the members collection
 */
var insertMember = function(id, name, callback) {
    storyModel.MemberModel.findById(id, function(err, doc) {
        if(err) {
            callback(err);
            return;
        }

        if(!doc) {
            logger.log('info','Inserting member <' + name + '>');
            var member = new storyModel.MemberModel({ '_id': id, 'name': name });
            member.save(function(err) {
                (err) ? callback(err) : callback(); 
            });
        }
    });
};

/**
 * Inserts a list into the list collection
 */
var insertList = function(id, name, callback) {
    storyModel.ListModel.findById(id, function(err, doc) {
        if(err) {
            callback(err);
            return;
        }

        if(!doc) {
            logger.log('info','Inserting list <' + name + '>');
            var list = new storyModel.ListModel({ '_id': id, 'name': name.replace(/\[\d+\]/, '').trim() });
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

var getStories = function(startDate, endDate, featureGroup, callback) {
    var query = { deployed: true };
    if(startDate && endDate) {
        query.deployedOn = { $gte: startDate, $lt: endDate }; 
    }
   
    if(featureGroup) {
        query.featureGroups = featureGroup;
    }
    
    storyModel.StoryModel.find(query, function(err, docs) {
        callback(err, docs);
    });
};

/**
 * MongoDB map/reduce that returns story velocity aggregated by week
 */
var getDeploymentVelocity = function(startDate, endDate, callback) {
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
        query: { deployed: true, deployedOn: {$gte: startDate, $lt: endDate} },
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
                              
                              var result = {  
                                  week_of: new Date(date_util.firstDayOfWeek(weeknum, year)), 
                                  defect_velocity: result.value.defect_velocity, 
                                  feature_velocity: result.value.feature_velocity, 
                                  excellence_velocity: result.value.excellence_velocity, 
                                  total: result.value.defect_velocity + result.value.feature_velocity + result.value.excellence_velocity 
                              }; 
                            
                              return result;
                          }
                    )
                );
            } else {
                callback(err, []);
            }
        }
    );
};

/**
 * MongoDB map/reduce that returns point totals aggregated by feature groups for deployed stories
 */
var getPointsByFeatureGroup = function(startDate, endDate, callback) {
    var map = function() {
        if(this.featureGroups && this.featureGroups.length > 0 && this.size) {
            emit(this.featureGroups[0], this.size);
        }
    };

    var reduce = function(key, values) {
        var size = 0;
        values.forEach(function(value) {
            size += value;
        });

        return size;
    };

    var command = {
        mapreduce: 'stories',
        map:  map.toString(),
        reduce: reduce.toString(), // map and reduce functions need to be strings
        query: { deployed: true, deployedOn: {$gte: startDate, $lt: endDate} },
        out: { inline: 1 }
    };

    mongoose.connection.db.executeDbCommand(
        command, function(err, results) {
            if(err) {
                logger.log('error', err);
            }

            if(results.numberReturned > 0) {
                callback(err, 
                    _.map(results.documents[0].results, function(result, key) {
                            return { featureGroup: result._id, size: result.value };
                    })
                );
            } else {
                callback(err, []);
            }
        }
    );
};

/**
 * Calculate rolling average period-over-period velocity. The periods are split 
 * at the halfway point between start and end
 * @param currentPeriodStartDate  date 
 * @param currentPeriodEndDate    date 
 */
var getVelocityTrend = function(currentPeriodStartDate, currentPeriodEndDate, callback) {
    var previousPeriodStartDate = new Date(currentPeriodStartDate.getTime() - (currentPeriodEndDate.getTime() - currentPeriodStartDate.getTime()));
    getDeploymentVelocity(previousPeriodStartDate, currentPeriodEndDate, function(err, results) {
        var currentPeriodPoints = 0, currentPeriodCount = 0,  previousPeriodPoints = 0, previousPeriodCount = 0;
        _.each(results, function(result) {
            if(result.week_of > previousPeriodStartDate && result.week_of <= currentPeriodStartDate) {
                previousPeriodPoints += result.total;
                previousPeriodCount++;
            } else if (result.week_of > currentPeriodStartDate && result.week_of <= currentPeriodEndDate) {
                currentPeriodPoints += result.total; 
                currentPeriodCount++;
            }
        });

        var data = { 
            current: { 
                points: (currentPeriodPoints / currentPeriodCount)
            }, 
            previous:  {
                points: (previousPeriodPoints / previousPeriodCount)
            }
        };

        callback(err, data);
    });
};

/**
 * Calculate the cycle time (Number of days between a story initially hitting "In Progress" and eventually 
 * ending up in the "Deployed" lane
 *
 * @param callback  Executed when the function is complete
 */
var calculateCycleTime = function(callback) {
    var isDeployed = /Deployed\s+\d+\/\d+/;
    // Iterate over all stories 
    storyModel.StoryModel.find({ deployed: true }, function(err, docs) {
        async.forEachSeries(docs, function(story, forEachCallback) {
           // Calculate cycle time if we don't already have a data point for this story.
           storyModel.CycleTimeModel.findOne({ storyId: story.id }, function(err, ctm) {
                if(!ctm) {
                    var start, end;
                    _.each(story.listHistory, function(item) {
                        // Start date is the point when the story moves from Ready Backlog to In Progress
                        if(item.listBefore == 'Ready Backlog' && item.listAfter === 'In Progress') {
                            if(!start || (item.date < start.toDate())) {
                                start = moment(item.date); 
                            } 
                        } 
                    });
                    // End date is the deployment date
                    end = moment(story.deployedOn); 
                    if(start && end) {
                        var ctm = new storyModel.CycleTimeModel({
                            storyId: story.id,
                            deployedOn: end.toDate(),
                            size: story.size
                        });
                        
                        var cycleTime = end.diff(start, 'days');
                        // 1 day is the minimum grain
                        if(cycleTime <= 0) cycleTime++;    
                        ctm.cycleTimeDays = cycleTime;

                        ctm.save(function(err) {
                            if(err) console.log(err);
                            forEachCallback();
                        });
                    } else {
                        forEachCallback();
                    }
                } else {
                    forEachCallback();
                }
            });
        },
        function(err) {
            (err) ? callback(err) : callback();
        });
    });
};

// The module's public API
exports.calculateCycleTime = calculateCycleTime;
exports.getDeploymentVelocity = getDeploymentVelocity;
exports.getStories = getStories;
exports.getVelocityTrend = getVelocityTrend;
exports.getPointsByFeatureGroup = getPointsByFeatureGroup;
exports.insertMember = insertMember;
exports.insertList = insertList;
