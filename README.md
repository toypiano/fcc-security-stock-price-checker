# FreeCodeCamp- Information Security and Quality Assurance

---

## Project Stock Price Checker

1. SET NODE_ENV to `test` without quotes and set DB to your mongo connection string

2. Complete the project in `routes/api.js` or by creating a handler/controller

3. You will add any security features to `server.js`

4. You will create all of the functional tests in `tests/2_functional-tests.js`

## User Stories

### Set the content security policies to only allow loading of scripts and CSS from your server.

- [Helmet.js - Content Security Policy](https://helmetjs.github.io/docs/csp/)

`server.js`

```js
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self"],
      styleSrc: ["'self'"],
    },
  })
);
```

### I can GET /api/stock-prices with form data containing a Nasdaq stock ticker and receive back an object stockData.

`api.js`

```js
app.route('/api/stock-prices').get((req, res) => {
  const stock = req.query.stock;
  const like = req.query.like || false;
  const reqIP = req.connection.remoteAddress;

  // handle multiple stock inputs
  if (Array.isArray(stock)) {
    // ...
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
```

### In stockData, I can see the stock (the ticker as a string), price (decimal in string format), and likes (int).

`stock-controller.js`

```js
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
```

### I can also pass along the field like as true (boolean) to have my like added to the stock(s). Only 1 like per IP should be accepted.

`stock-controller.js`

```js
/**
 * Load likes from db or upsert unique ip into likes array
 * @param {string} stock
 * @param {"true" | "false" | undefined | boolean} like
 * @param {string} ip
 */
const loadLikes = async (stock, like, ip, callback) => {
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
      console.log(likeData);
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
```

### If I pass along 2 stocks, the return object will be an array with information about both stocks. Instead of likes, it will display rel_likes (the difference between the likes) on both.

`api.js`

```js
// ...
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
}
```

### A good way to receive current prices is through our stock price proxy (replacing 'GOOG' with your stock symbol): https://repeated-alpaca.glitch.me/v1/stock/GOOG/quote

### All 5 functional tests are complete and passing.

## Note

### Request module is deprecated and returns 403 (Forbidden)

- Request is [fully deprecated](https://github.com/request/request) as of Fev 11th 2020
- Use axios instead to make it work.

### Async Await is more readable than old callback based API

- Making async API call and passing returned data into callback function make it difficult to understand what the callback function does because the data and handlers are separated.

### Increase default timeout for mocha

- Testings were slow due to external API being on glitch which spins up upon request.

`2_functional-tess.js`

```js
suite('Functional Tests', function () {
  this.timeout(10000); // this doesn't work inside arrow functions
  suite('GET /api/stock-prices => stockData object', function () {
    test('1 stock', function (done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog' })
        .end(function (err, res) {
          // asserts
          done();
        });
    });
```
