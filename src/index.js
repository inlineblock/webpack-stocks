import notifier from 'node-notifier';
import yahooFinance from 'yahoo-finance';
import fs from 'fs';
import path from 'path';

const successImage = path.join(__dirname, '../images', 'webpack-done.png');
const stocksImage = path.join(__dirname, '../images', 'webpack-stocks.png');
const errorImage = path.join(__dirname, '../images', 'webpack-fail.png');
const buildingImage = path.join(__dirname, '../images', 'webpack-building.png');

export default class WebpackStocksPlugin {

  constructor (options = {}) {
    this.options = options;
    this.symbols = options.symbols;
    if (!this.symbols) {
      this.readTickers();
    }
  }

  apply (compiler) {
    compiler.plugin('compile', this.onCompile);
    compiler.plugin('done', this.onDone);
    const options = compiler.options || {};
    this.name = options.name || options.entry;
    if (typeof this.name !== 'string') {
      this.name = this.name[this.name.length - 1];
    }
  }

  onError = (error) => {
    this.notify({
      title: 'Webpack Build Error',
      message: error,
      icon: errorImage,
    });
  }

  onDone = (stats) => {
    if (stats.hasErrors()) {
      this.onError(stats.compilation.errors[0].name);
    } else {
      const time = new Date();
      const timeDiff = Math.round((time.getTime() - this.time.getTime()) / 10);
      this.notify({
        title: 'Webpack Build Complete',
        message: `${timeDiff / 100} seconds - ${this.name}`,
        icon: successImage,
      });
    }
  }

  onCompile = () => {
    this.time = new Date();
    this.notify({
      title: 'Webpack Build Compiling',
      message: this.name,
      icon: buildingImage,
    });
    const symbols = this.getSymbols();
    if (symbols && symbols.length) {
      this
        .fetchPrices()
        .then(this.emitPrices)
        .then(this.storePrices);
    } else if (!this.hasNotified) {
      this.hasNotified = true;
      this.notify({
        title: 'Webpack Stocks error',
        message: `No stocks symbols found in ~/.stocksrc.
          Add symbols, new line separated, restart webpack.`,
        icon: errorImage,
      });
    }
  }

  readTickers () {
    const file = fs.readFileSync(path.join(process.env.HOME, '.stocksrc'));
    this.symbols = file.toString('ascii').split('\n').filter(s => !!s).map(s => s.toUpperCase());
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
      if (ticker.lastTradePriceOnly) {
        const priceParts = String(ticker.lastTradePriceOnly).split('.');
        const price = `${priceParts[0]}.${priceParts[1].substr(0, 2)}`;
        return `${ticker.symbol}: $${price}`;
      }
      return '';
    }).filter(s => !!s).join(' | ');

    return this.notify({
      title: 'Webpack Stocks',
      message,
      icon: stocksImage,
    }, prices);
  }

  storePrices = (prices) => {
    this.lastPrices = prices.reduce((lastPrices, ticker) => {
      lastPrices[ticker.symbol] = ticker.lastTradePriceOnly;
      return lastPrices;
    }, {});
  }

  notify (options, resolveWith = undefined) {
    return new Promise((resolve) => {
      notifier.notify(options);
      resolve(resolveWith || options.message);
    });
  }

}
