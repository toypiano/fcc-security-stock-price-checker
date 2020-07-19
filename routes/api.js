/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var { getData, loadLikes } = require('../controllers/stock-controller.js');

module.exports = function (app) {
  app.route('/api/stock-prices').get((req, res) => {
    const stock = req.query.stock;
    const like = req.query.like || false;
    const reqIP = req.connection.remoteAddress;

    // handle multiple stock inputs
    if (Array.isArray(stock)) {
      (async () => {
        try {
          const firstStockData = await getData(stock[0]);
          const { likes: firstLikes } = await loadLikes(stock[0], like, reqIP);
          const secondStockData = await getData(stock[1]);
          const { likes: secondLikes } = await loadLikes(stock[1], like, reqIP);

          firstStockData.rel_likes = firstLikes - secondLikes;
          secondStockData.rel_likes = secondLikes - firstLikes;

          res.json({ stockData: [firstStockData, secondStockData] });
        } catch (err) {
          console.log(err);
        }
      })();
    } else {
      // handle single stock input
      (async () => {
        try {
          const stockData = await getData(stock);
          const { likes } = await loadLikes(stock, like, reqIP);

          stockData.likes = likes;

          res.json({ stockData });
        } catch (err) {
          console.log(err);
        }
      })();
    }
  });
};
