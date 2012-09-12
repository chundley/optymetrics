var mongoose = require('mongoose');

var encodePassword = require('./model/auth-model.js').encodePassword, 
    UserModel = require('./model/auth-model.js').UserModel,
    UserRoles = require('./model/auth-model.js').UserRoles;

exports.addUser = function(email, password, callback) {
    var user = new UserModel({
        email: email,
        password: password,
        role: UserRoles.USER
    });
    
    user.save(function(err) {
        (err) ? callback(err) : callback();
    });
};

exports.getUser = function(email, password, callback) {
    UserModel.findOne({ email: email, password: encodePassword(password) }, function(err, doc) {
        callback(err, doc);
    });  
};
