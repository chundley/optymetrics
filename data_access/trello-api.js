/**
 * Trello API client
 */

/**
 * Node includes
 */
var async = require('async'),
    oauth = require('oauth'),
    rest = require('restler'),
    _ = require('underscore');

/**
 * Project includes
 */
var logger = require('../util/logger.js'),
    storyDao = require('./story-dao.js'),
    storyModel = require('./model/story-model.js');

var key = 'df90ea5c83fc1d11eba9510bc5006ad6',
    secret = '95a9ca0722ab5804699652e49506fc4bef726af2f83c7c953a17a6abf113c9ff',
    // Requested OAuth token that never expires. This is the only way to manually obtain a token without manual
    // intervention. Yay, OAuth! If you need to generate a new token, use the following URL:
    // https://trello.com/1/authorize?response_type=token&key=df90ea5c83fc1d11eba9510bc5006ad6&scope=read&expiration=never
    token = '08dc249caa9085154b58f4be3cb22b96adac735318c7a33eaa81d86aec421016',
    kanban_board_id = '4feb247bb42644e7707c305c',
    baseUrl = 'https://trello.com/1/';

var getBoardUrl = function() {
    return baseUrl + 'boards/' + kanban_board_id + '/cards?key=' + key + '&token=' + token;
};

var getListUrl = function() {
    return baseUrl + 'boards/' + kanban_board_id + '/lists?key=' + key + '&token=' + token;
};

var getMemberUrl = function() {
    return baseUrl + 'boards/' + kanban_board_id + '/members?key=' + key + '&token=' + token;
};

var getCardListHistoryUrl = function(cardId) {
    return baseUrl + 'cards/' + cardId + '/actions?filter=updateCard:idList&key=' + key + '&token=' + token;
};

var getLabelModel = function(resultLabels) {
    var labels = [];
    _.each(resultLabels, function(label) {
        labels.push(new storyModel.LabelModel({ 'color': label.color, 'name': label.name }));
    });

    return labels;
};
var getStorySize = function(name) {
    var storySizeRegex = /.?\((\d{1,2})\).?/;
    var matches = storySizeRegex.exec(name);
    if(matches && matches.length == 2) {
        return matches[1];
    } else {
        logger.log('info','Could not parse a size for story ' + name + '"');
    }
    return null;
};

var getFeatureGroups = function(name) {
    var featureGroupRegex = /\[(.+)\]$/;
    var matches = featureGroupRegex.exec(name.trim());
    if(matches && matches.length == 2) {
        return matches[1];
    }
    return null;
};

var getDeploymentDate = function(listName) {
    var deployDateRegex = /Deployed\s(\d{1,2}\/\d{1,2})/gi;
    var matches = deployDateRegex.exec(listName);
    if(matches && matches.length == 2) {
        var dateMonth = matches[1].split("/");
        return new Date(new Date().getFullYear(), parseInt(dateMonth[0]) - 1, parseInt(dateMonth[1]));
    }

    return null;
};

var backfillMembers = function(callback) {
    rest.get(getMemberUrl()).on('complete', function(results) {
        var error;
        _.each(results, function(result) {
            storyDao.insertMember(result.id, result.fullName, function(err) {
                if(err) {
                    error = err;
                    logger.log('info','Unable to backfill member <' + result.fullName + '> ' + err);
                }
            });
        });

        callback(error);
    }).on('error', function(error) { logger.log('info',error); });;
};

var backfillLists = function(callback) {
    rest.get(getListUrl()).on('complete', function(results) {
        var error;
        _.each(results, function(result) {
            storyDao.insertList(result.id, result.name, function(err) {
                if(err) {
                    error = err;
                    logger.log('info','Unable to backfill list <' + result.name + '> ' + err);
                }
            });
        });

        callback(error);
    }).on('error', function(error) { logger.log('info',error); });
};

var cleanListName = function(list) {
    return list.replace(/\[\d+\]/, '').trim();
};

var getCardListHistory = function(story, callback) {
    rest.get(getCardListHistoryUrl(story._id)).on('complete', function(results) {
        var cardHistory = []; 
        _.each(results, function(result) {
            var listBefore = cleanListName(result.data.listBefore.name);
            var listAfter = cleanListName(result.data.listAfter.name);
            cardHistory.push({ 
                'listBefore': listBefore,
                'listAfter': listAfter,
                'date': result.date
            });
        });

        story.listHistory = cardHistory;
        callback();
    }).on('error', function(err) {
        logger.log('error', err); 
        callback(err);
    });
};

var backfillStories = function(callback) {
    rest.get(getBoardUrl()).on('complete', function(results) {
        _.each(results, function(result) {
            storyModel.StoryModel.findById(result.id, function(err, doc) {
                var story;
                if(!doc) {
                    logger.log('info','No story found with id ' + result.id + '. Creating...');

                    story = new storyModel.StoryModel({
                        _id: result.id,
                        name: result.name,
                        size: getStorySize(result.name),
                        featureGroups: getFeatureGroups(result.name),
                        labels: getLabelModel(result.labels),
                        members: [],
                        listHistory: []
                    });
                } else {
                    logger.log('info','Updating story with id ' + result.id);
                    story = doc;
                }

                story.name = result.name;
                story.size = getStorySize(result.name);
                story.featureGroups = getFeatureGroups(result.name);
                story.labels = getLabelModel(result.labels);

                async.series([
                    // Look up and assign members
                    function(callback) {
                        async.forEach(result.idMembers, function(id, callback) {
                            storyModel.MemberModel.findById(id, function(err, doc) {
                                if(doc) {
                                    var member_found = _.any(story.members, function(value) {
                                        return value._id.toString() == id;
                                    }); 
                                    if(!member_found) {
                                        story.members.push(new storyModel.MemberModel({ '_id': doc.id, 'name': doc.name }));
                                    }
                                }
                                callback();
                            });
                         },
                        function(err) {
                            if(err) logger.log('info',err);
                            callback();
                        });
                    },
                    // Look up and assign the current list and add to list
                    // history
                    function(callback) {
                        getCardListHistory(story, callback);
                    },
                    // Save the story
                    function(callback) {
                        story.save(function() { });
                        callback();
                    }
                ]);
            });
        });
        callback();
    }).on('error', function(error) { logger.log('info',error); });
};

exports.backfillLists = backfillLists;
exports.backfillMembers = backfillMembers;
exports.backfillStories = backfillStories;
