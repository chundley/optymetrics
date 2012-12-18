/**
* Access for reporting on Ops/TCO data
*/

var mongoose = require('mongoose'),
    customer_model = require('./model/customer-model.js');

/**
* Get TCO data for Customers only, sorted by total tco descending
*
* @param limit  The number of rows to return
*/
var getCustomerTCOData = function (limit, callback) {
    var command = {
        aggregate: 'customers',
        pipeline:
          [
            { $unwind: '$organizations'},
            { $group: {_id: {
                    id: '$id',
                    name: '$name',
                    createdAt: '$createdAt',
                    sku:'$sku',
                    visitors: '$visitors',
                    keywords: '$keywords',
                    tcoTraffic: '$tcoTraffic',
                    tcoSEO: '$tcoSEO',
                    tcoTotal: '$tcoTotal',
                    mrr: '$mrr',
                    netRevenue: '$netRevenue',
                    bigScore: '$bigScore'
                    },
                    sites: {$sum: 1}
                }
            },
            { $project: {
                    _id: 0,
                    sites: '$sites',
                    id: '$_id.id',
                    name: '$_id.name',
                    createdAt: '$_id.createdAt',
                    sku: '$_id.sku',
                    visitors: '$_id.visitors',
                    keywords: '$_id.keywords',
                    tcoTraffic: '$_id.tcoTraffic',
                    tcoSEO: '$_id.tcoSEO',
                    tcoTotal: '$_id.tcoTotal',
                    mrr: '$_id.mrr',
                    netRevenue: '$_id.netRevenue',
                    bigScore: '$_id.bigScore'
                }
            },
            { $sort: {tcoTotal: -1}},
            { $limit: parseInt(limit)}
          ]
    };
    mongoose.connection.db.executeDbCommand(command, function (err, results) {
        callback(null, results.documents[0].result);
    });    
};

exports.getCustomerTCOData = getCustomerTCOData
