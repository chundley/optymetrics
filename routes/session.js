var authDao = require('../data_access/auth-dao.js');

/*
 * GET request for new session (login) page
 */
exports.login = function(req, res, next) {
    res.render('login', { 
        title: 'Login', 
        scripts: [],
        message: null
    });
};

/*
 * POST request for new session (login) page
 */
exports.loginSubmit = function(req, res, next) {
    authDao.getUser(
        req.body.email,
        req.body.password,
        function(err, user) {
            // Auth failed 
            if(!user) {
                res.render('login', {
                    title: 'Login',
                    scripts: [],
                    message: {
                        content: 'Invalid email or password',
                        level: 'error'
                    }
                });
                
                return;
            }

            // Auth successful
            req.session.userAuthenticated=true
            req.session.user = { email: user.email, role: user.role, displayName: user.displayName };

            if(req.query.redir) {
                res.redirect(req.query.redir);
            } else {
                res.redirect('/');
            }
        }
    );
};

/*
 * GET request for logout
 */
exports.logout = function(req, res, next) {
    req.session.destroy();
    res.redirect('/');
};
