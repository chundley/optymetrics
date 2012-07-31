// Trello API client
// TODO: The token is only good for 30 days. How can I refresh this
// programmatically?

var async = require('async'),
    metrics_dao = require('./metrics_dao.js'),
    rest = require('restler'),
    _ = require('underscore');

var key = 'df90ea5c83fc1d11eba9510bc5006ad6',
    secret = '95a9ca0722ab5804699652e49506fc4bef726af2f83c7c953a17a6abf113c9ff',
    token = '513272175833f21948cc4987c00750df820f3c8c1ef852f657754aa9457acf4c',
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

var getLabelModel = function(resultLabels) {
    var labels = [];
    _.each(resultLabels, function(label) {
        labels.push(new metrics_dao.LabelModel({ 'color': label.color, 'name': label.name }));
    });

    return labels;
};
var getStorySize = function(name) {
    var storySizeRegex = /.?\((\d{1,2})\).?/;
    var matches = storySizeRegex.exec(name);
    if(matches && matches.length == 2) {
        return matches[1];
    } else {
        console.log('Could not parse a size for story ' + name + '"');
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
            metrics_dao.insertMember(result.id, result.fullName, function(err) {
                if(err) {
                    error = err;
                    console.log('Unable to backfill member <' + result.fullName + '> ' + err);
                }
            });
        });

        callback(error);
    }).on('error', function(error) { console.log(error); });;
};

var backfillLists = function(callback) {
    rest.get(getListUrl()).on('complete', function(results) {
        var error;
        _.each(results, function(result) {
            metrics_dao.insertList(result.id, result.name, function(err) {
                if(err) {
                    error = err;
                    console.log('Unable to backfill list <' + result.name + '> ' + err);
                }
            });
        });

        callback(error);
    }).on('error', function(error) { console.log(error); });
};

var backfillStories = function(callback) {
    rest.get(getBoardUrl()).on('complete', function(results) {
        _.each(results, function(result) {
            metrics_dao.StoryModel.findById(result.id, function(err, doc) {
                var story;
                if(!doc) {
                    console.log('No story found with id ' + result.id + '. Creating...');

                    story = new metrics_dao.StoryModel({
                        _id: result.id,
                        name: result.name,
                        size: getStorySize(result.name),
                        labels: getLabelModel(result.labels),
                        members: [],
                        listHistory: []
                    });
                } else {
                    console.log('Updating story with id ' + result.id);
                    story = doc;
                }

                story.name = result.name,
                story.size = getStorySize(result.name),
                story.labels = getLabelModel(result.labels),
                story.members = [],

                async.series([
                    // Look up and assign members
                    function(callback) {
                        story.members = [];
                        async.forEach(result.idMembers, function(id, callback) {
                            metrics_dao.MemberModel.findById(id, function(err, doc) {
                                if(doc) story.members.push(new metrics_dao.MemberModel({ 'name': doc.name }));
                                callback();
                            });
                         },
                        function(err) {
                            if(err) console.log(err);
                            callback();
                        });
                    },
                    // Look up and assign the current list and add to list
                    // history
                    function(callback) {
                        metrics_dao.ListModel.findById(result.idList, function(err, doc) {
                            if(doc) {
                                story.list = doc;
                                story.listHistory.push({ date: new Date(), list: doc.name });

                                var deployDate = getDeploymentDate(doc.name);
                                if(deployDate && !story.deployed) {
                                    if(deployDate > new Date()) {
                                        console.log('Deployment date for story ' + story.id + ' is in the future. Not marking it as deployed for now');
                                    } else {
                                        story.deployed = true;
                                        story.deployedOn = deployDate;
                                    }
                                }
                            }
                            callback();
                        });
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
    }).on('error', function(error) { console.log(error); });
};

exports.backfillLists = backfillLists;
exports.backfillMembers = backfillMembers;
exports.backfillStories = backfillStories;
