const WebpackStocksPlugin = require('../lib/index');

const plugin = new WebpackStocksPlugin.default({
  symbols: ['AAPL', 'RAD'],
});
plugin.onCompile();
