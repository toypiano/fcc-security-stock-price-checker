/*
 *
 *
 *       Complete the handler logic below
 *
 *
 */

const MongoClient = require('mongodb');
const CONNECTION_STRING = process.env.DB_URI;

const axios = require('axios');

/**
 * Get stock data from external API
 * @param {string} stock
 */
const getData = async (stock) => {
  try {
    const { data } = await axios.get(
      `https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`
    );
    const stockData = {
      stock: data.symbol,
      price: data.latestPrice,
    };
    // callback('stockData', {
    //   stock: data.symbol,
    //   price: data.latestPrice,
    // });
    return stockData;
  } catch (err) {
    console.log(err);
    return { message: 'external source error', error: err };
  }
};

/**
 * Load likes from db or upsert unique ip into likes array
 * @param {string} stock
 * @param {"true" | "false" | undefined | boolean} like
 * @param {string} ip
 */
const loadLikes = async (stock, like, ip) => {
  try {
    const client = await MongoClient.connect(CONNECTION_STRING);
    const db = client.db('stock-price-checker');
    const collection = db.collection('stock_likes');

    // 'like' is not checked:
    if (!like || like === 'false') {
      const stocks = await collection
        .find({ stock: stock.toLowerCase() })
        .toArray();

      if (stocks.length === 0) {
        throw new Error('Could not find the stock');
      }

      // Convert an array of ip address into number
      const likes = stocks[0].likes ? stocks[0].likes.length : 0;

      const likeData = {
        stock: stock,
        likes: likes,
      };

      // callback('likeData', likeData);
      return likeData;
    } else {
      // 'like' is checked:
      // push unique ip into likes array with upsert - If likes array doesn't exist already, create it and push
      const { value } = await collection.findOneAndUpdate(
        { stock: stock.toLowerCase() },
        { $addToSet: { likes: ip } },
        { upsert: true, returnOriginal: false }
      );

      const likeData = {
        stock: stock,
        likes: value.likes.length,
      };

      return likeData;
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = { getData, loadLikes };
