// Access to the core postgres database

var logger = require('../util/logger.js'),
    pg = require('pg'),
    _ = require('underscore'),
    coredb_config = require('config').CoreDb
    conn_str = 'postgres://' + coredb_config.username + ':' + coredb_config.password + '@' + coredb_config.dbHost + ':' + coredb_config.dbPort + '/' + coredb_config.database;

var getDomains = function (callback) {
    logger.log('info', conn_str);
    pg.connect(conn_str, function (err, client) {
        if (err) {
            logger.log('info', err);
        }
        else {
            logger.log('info', 'Connected to Postgres: ' + conn_str);
        }

        client.query('select org_name, domain from organization', function (err, result) {
            if (err) {
                logger.log('info', 'Error: ' + err);
            }
            else {
                var orgs = [];
                for (var row = 0; row < result.rows.length; row++) {
                    var org = {
                        org_name: result.rows[row].org_name,
                        domain: result.rows[row].domain
                    }
                    orgs.push(org);
                }
                callback(err, orgs);
            }
        });
    });
};

exports.getDomains = getDomains;
