import notifier from 'node-notifier';
import yahooFinance from 'yahoo-finance';
import fs from 'fs';
import path from 'path';

export default class WebpackStocksPlugin {

  constructor (options) {
    this.options = options;
    this.readTickers();
  }

  apply (compiler) {
    compiler.plugin('compile', this.onCompile);
  }

  onCompile = () => {
    if (this.symbols && this.symbols.length) {
      this
        .fetchPrices()
        .then(this.emitPrices)
        .then(this.storePrices);
    } else {
      console.log('No symbols found in ~/.stocksrc');
    }
  }

  readTickers () {
    const file = fs.readFileSync(path.join(process.env.HOME, '.stocksrc'));
    this.symbols = file.toString('ascii').split("\n").filter(d => !!d);
  }

  fetchPrices () {
    return new Promise((resolve, reject) => {
      yahooFinance.snapshot({
        symbols: this.getSymbols(),
        fields: ['s', 'n', 'l1', 'c6', 'k2'],
      }, (err, snapshot) => {
        if (err) {
          reject(err);
        } else {
          resolve(snapshot);
        }
      });
    });
  }

  getSymbols () {
    return this.symbols;
  }

  emitPrices = (prices) => {
    const message = prices.map((ticker) => {
      return `${ticker.symbol}: $${ticker.lastTradePriceOnly}`;
    }).join("\n");

    return new Promise((resolve) => {
      notifier.notify({
        title: 'Webpack Building',
        message,
      }, this.options);
      resolve(prices);
    });
  }

  storePrices = (prices) => {
    this.lastPrices = {};
    prices.map((ticker) => {
      this.lastPrices[ticker.symbol] = ticker.lastTradePriceOnly;
    });
  }
}
