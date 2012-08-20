_ = require('underscore');

var hashToArray = function (hash) {
    var arr = [];
    _.each(hash, function (item) {
        arr.push(item);
    });
    return arr;
};

exports.hashToArray = hashToArray;