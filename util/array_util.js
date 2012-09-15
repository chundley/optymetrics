_ = require('underscore');

var hashToArray = function (hash) {
    var arr = [];
    _.each(hash, function (item) {
        arr.push(item);
    });
    return arr;
};

var objectKeySort = function (o) {
    var a = {};
    var sortedKeys = _.keys(o).sort();
    for(var i in sortedKeys){ 
        a[sortedKeys[i]] = o[sortedKeys[i]];
    }
    return a;
};

exports.hashToArray = hashToArray;
exports.objectKeySort = objectKeySort;