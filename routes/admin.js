var authDao = require('../data_access/auth-dao.js'),
    UserRoles = require('../data_access/model/auth-model.js').UserRoles;

exports.index = function(req, res, next) {
    authDao.getUsers(function(err, users) {
        res.render('admin', { title: 'Admin', roles: UserRoles, scripts: [], message: null, users: users });
    });
};

exports.addUser = function(req, res, next) {
    var displayName = req.body.displayname;
    var email = req.body.email;
    var password = req.body.password;
    var confirm = req.body.confirm;
    var role = req.body.role;

    authDao.getUsers(function(err, users) {
        if(!(email && password && confirm && displayName)) {
            res.render('admin', { title: 'Admin', roles: UserRoles, scripts: [], message: { level: 'error', content: 'Display name, Email, password, and repeat password are required' }, users: users });
            return;
        }   

        if(password != confirm) {
            res.render('admin', { title: 'Admin', roles: UserRoles, scripts: [], message: { level: 'error', content: 'Passwords do not match' }, users: users });
            return;
        }

        authDao.getUserByEmail(email, function(err, doc) {
            if(doc) {
                res.render('admin', { title: 'Admin', roles: UserRoles, scripts: [], message: { level: 'warn', content: 'User already exists' }, users: users });
                return;
            }

            authDao.addUser(displayName, email, password, role, function(err) {
                if(err) {
                    res.render('admin', { title: 'Admin', roles: UserRoles, scripts: [], message: { level: 'error', content: 'Unable to add user' }, users: users });
                    return;
                }
                
                res.render('admin', { title: 'Admin', roles: UserRoles, scripts: [], message: { level: 'success', content: 'User added' }, users: users });
                return;
            });
        });
    });
};
