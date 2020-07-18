/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  app.route('/api/stock-prices').get(function (req, res) {
    console.log('GET /api/stock-prices');
    var stock = req.query.stock;
    var like = req.query.like || false; // default to false if not included
    var reqIP = req.connection.remoteAddress;
    console.log(stock, like, reqIP);
  });
};
