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

### I can GET /api/stock-prices with form data containing a Nasdaq stock ticker and recieve back an object stockData.

### In stockData, I can see the stock (the ticker as a string), price (decimal in string format), and likes (int).

### I can also pass along the field like as true (boolean) to have my like added to the stock(s). Only 1 like per IP should be accepted.

### If I pass along 2 stocks, the return object will be an array with information about both stocks. Instead of likes, it will display rel_likes (the difference between the likes) on both.

### A good way to receive current prices is through our stock price proxy (replacing 'GOOG' with your stock symbol): https://repeated-alpaca.glitch.me/v1/stock/GOOG/quote

### All 5 functional tests are complete and passing.
