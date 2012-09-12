var mongoose = require('mongoose'),
    SHA2 = new (require('jshashes').SHA512)();

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Model = mongoose.Model,
    salt = 'It need more spice! I could just cry.';
    

function encodePassword(pass) {
    // This will cause the model to fail validation 
    if(typeof pass === 'string' && pass.length < 8) return '';

    return SHA2.b64_hmac(pass, salt);
};

exports.encodePassword = encodePassword;

exports.UserRoles = {
    USER: "User",
    ADMIN: "Admin"
};

exports.UserSchema = new Schema({
    email           : { type: String, required: true,  trim: true },
    password        : { type: String, set: encodePassword, required: true,  trim: true },
    role            : { type: String, required: true }
});

exports.UserModel = mongoose.model('User', exports.UserSchema);
