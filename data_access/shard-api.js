/**
* Access to the Optify shard databases
*/

/**
* node.js libraries
*/
var async = require('async'),
    pg = require('pg'),
    _ = require('underscore');

/**
* Local project libraries
*/
var logger = require('../util/logger.js'),
    shard_model = require('./model/shard-model.js'),
    array_util = require('../util/array_util.js');

/**
* Updates the traffic counts of the organization passed and
* returns the organization
*/
var getTrafficCounts = function (connectionString, organization, callback) {
    pg.connect(connectionString, function (err, client) {
        client.query(QUERY_VISITORS, [organization.id], function (err, result) {
            if (err) {
                callback(err, null);
            }
            else {
                if (result.rows.length > 0) {
                    organization.visitors = result.rows[0].visitors;
                    organization.visits = result.rows[0].visits;
                    organization.pageviews = result.rows[0].pageviews;

                    callback(null, organization);
                }
                else {
                    callback(null, organization);
                }
            } // end else
        }); // end client.query
    }); // end pg.connect
}

exports.getTrafficCounts = getTrafficCounts;

/**
* Query "constants"
*/
var QUERY_VISITORS = "select " +
                             "d.organization_id, " +
                             "count(*) as \"visitors\", " +
                             "sum(num_visits) as \"visits\", " +
                             "sum(num_pageviews) as \"pageviews\" " +
                        "from visit_rollup_daily d " +
                        "JOIN visit_aggregate_detail det on d.visit_aggregate_detail_id = det.id " +
                        "where d.organization_id = $1 " +
                        "and rollup_day < now() - INTERVAL '1 DAY' and rollup_day >= now() - INTERVAL '31 DAY' " +
                        "group by d.organization_id";

/*
var QUERY_VISITORS = "select " +
                             "va.organization_id, " +
                             "count(va.id) as \"visitors\", " +
                             "sum(va.total_visits) as \"visits\", " +
                             "sum(va.total_pageviews) as \"pageviews\" " +
                        "from visitor_aggregate va " +
                        "where va.organization_id = $1 " +
                        "and va.last_visit_date < now() - INTERVAL '1 DAY' and va.last_visit_date  >= now() - INTERVAL '31 DAY' " +
                        "group by va.organization_id";
*/
/*
SELECT
  d.organization_id, 
  count(*) as visitors
, sum(num_visits) as visits
, sum(num_pageviews) as pageviews
FROM visit_rollup_daily d
JOIN visit_aggregate_detail det on d.visit_aggregate_detail_id = det.id
WHERE d.organization_id = $1
AND rollup_day < now() - INTERVAL '1 DAY' and rollup_day  >= now() - INTERVAL '31 DAY' 
GROUP BY d.organization_id

*/