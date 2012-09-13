var authDao = require('../data_access/auth-dao.js'),
    UserRoles = require('../data_access/model/auth-model.js').UserRoles;

exports.index = function(req, res, next) {
    res.render('profile', { title: 'User Profile', scripts: [], message: null });
};

exports.changePassword = function(req, res, next) {
    var email = req.session.user.email;
    var password = req.body.password;
    var confirm = req.body.confirm;

    if(!(password && confirm)) {
        res.render('profile', { title: 'User Profile', scripts: [], 
                   message: { level: 'error', content: 'Password, and repeat password are required' } });
        return;
    }   

    if(password != confirm) {
        res.render('profile', { title: 'User Profile', scripts: [], message: { level: 'error', content: 'Passwords do not match' } });
        return;
    }

    authDao.getUserByEmail(email, function(err, doc) {
        doc.password = password;
        doc.save(function(err) {
            if(err) {
                res.render('profile', { title: 'User Profile', scripts: [], message: { level: 'error', content: 'Password update failed' } });
                return;
            }
            
            res.render('profile', { title: 'User Profile', scripts: [], message: { level: 'success', content: 'Password changed' } });
            return;
        });
    });
};
